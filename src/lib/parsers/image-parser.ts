// @ts-nocheck
import { DocumentParser, ParsedDocument, MimeType } from './types';
// @ts-ignore
import sharp from 'sharp';
// @ts-ignore
import exifr from 'exifr';
// @ts-ignore
import * as tf from '@tensorflow/tfjs';
// @ts-ignore
import * as cocoSsd from '@tensorflow-models/coco-ssd';
// @ts-ignore
import * as blazeface from '@tensorflow-models/blazeface';
// @ts-ignore
import * as mobilenet from '@tensorflow-models/mobilenet';
// @ts-ignore
import { createWorker, Worker, createScheduler } from 'tesseract.js';

interface TableCell {
  text: string;
  confidence: number;
  bbox: number[];
}

interface Table {
  cells: TableCell[][];
  confidence: number;
}

// @ts-ignore
export class ImageParser implements DocumentParser {
  // @ts-ignore
  private scheduler: Tesseract.Scheduler;
  // @ts-ignore
  private workers: Worker[] = [];
  private readonly supportedLanguages = [
    'eng',
    'fra',
    'deu',
    'spa',
    'ita',
    'por',
    'rus',
    'chi_sim',
    'jpn',
    'kor',
  ];
  private readonly tableDetectionThreshold = 0.7;
  // @ts-ignore
  private objectDetectionModel: cocoSsd.ObjectDetection | null = null;
  // @ts-ignore
  private faceDetectionModel: blazeface.BlazeFaceModel | null = null;
  // @ts-ignore
  private classificationModel: mobilenet.MobileNet | null = null;

  // @ts-ignore
  constructor() {
    this.scheduler = createScheduler();
    this.initWorkers();
    this.initModels();
  }

  // @ts-ignore
  private async initWorkers() {
    try {
      // Initialize workers for each language
      for (const lang of this.supportedLanguages) {
        const worker = await createWorker(lang);
        // @ts-ignore
        await worker.loadLanguage(lang);
        // @ts-ignore
        await worker.initialize(lang);
        this.scheduler.addWorker(worker);
        this.workers.push(worker);
      }
    } catch (error) {
      console.error('Error initializing Tesseract workers:', error);
    }
  }

  // @ts-ignore
  private async initModels() {
    try {
      // Initialize models in parallel
      const [objectModel, faceModel, classModel] = await Promise.all([
        cocoSsd.load(),
        blazeface.load(),
        mobilenet.load(),
      ]);

      this.objectDetectionModel = objectModel;
      this.faceDetectionModel = faceModel;
      this.classificationModel = classModel;
    } catch (error) {
      console.error('Error initializing TensorFlow models:', error);
    }
  }

  async terminate() {
    for (const worker of this.workers) {
      await worker.terminate();
    }
    this.workers = [];
  }

  supportedTypes: MimeType[] = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/tiff',
    'image/bmp',
    'image/heic',
    'image/heif',
  ];

  // @ts-ignore
  private async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      // Apply a series of preprocessing steps
      const processedImage = await sharp(imageBuffer)
        .grayscale() // Convert to grayscale
        .normalize() // Normalize contrast
        .sharpen() // Sharpen the image
        .threshold(128) // Apply binary threshold
        .median(3) // Apply median filter to reduce noise
        .modulate({ brightness: 1.1, saturation: 0 }) // Adjust brightness
        .toBuffer();

      return processedImage;
    } catch (error) {
      console.error('Error preprocessing image:', error);
      return imageBuffer; // Return original if preprocessing fails
    }
  }

  // @ts-ignore
  private async detectTables(imageBuffer: Buffer): Promise<Table[]> {
    try {
      if (!this.objectDetectionModel) {
        await this.initModels();
        if (!this.objectDetectionModel) {
          throw new Error('Object detection model not initialized');
        }
      }

      // Convert buffer to tensor
      const image = await tf.browser.fromPixels(imageBuffer as any);
      const predictions = await this.objectDetectionModel.detect(image);
      tf.dispose(image);

      // Filter predictions for table-like objects
      const tablePredictions = predictions.filter(
        (pred) =>
          pred.class === 'dining table' ||
          pred.class === 'table' ||
          pred.score > this.tableDetectionThreshold
      );

      const tables: Table[] = [];

      for (const pred of tablePredictions) {
        // Extract the table region
        const [x, y, width, height] = pred.bbox;
        const tableImage = await sharp(imageBuffer)
          .extract({
            left: Math.round(x),
            top: Math.round(y),
            width: Math.round(width),
            height: Math.round(height),
          })
          .toBuffer();

        // Process the table region
        const processedTable = await this.preprocessImage(tableImage);
        const result = await this.scheduler.addJob('recognize', processedTable);

        // Parse the text into a table structure
        const lines = result.data.text
          .split('\n')
          .filter((line) => line.trim());
        const cells: TableCell[][] = lines.map((line) => {
          // Split line by multiple spaces or tabs
          const cellTexts = line.split(/\s{2,}|\t+/);
          return cellTexts.map((text) => ({
            text: text.trim(),
            confidence: result.data.confidence,
            bbox: [0, 0, 0, 0], // Simplified bbox for now
          }));
        });

        tables.push({
          cells,
          confidence: pred.score,
        });
      }

      return tables;
    } catch (error) {
      console.error('Error detecting tables:', error);
      return [];
    }
  }

  // @ts-ignore
  private async extractText(imageBuffer: Buffer): Promise<{
    text: string;
    confidence: number;
    language: string;
    tables: Table[];
  }> {
    try {
      if (this.workers.length === 0) {
        await this.initWorkers();
      }

      if (this.workers.length === 0) {
        throw new Error('No Tesseract workers initialized');
      }

      // Preprocess image
      const processedImage = await this.preprocessImage(imageBuffer);

      // Try to detect tables first
      const tables = await this.detectTables(processedImage);

      // Run OCR with all languages in parallel
      const results = await Promise.all(
        this.supportedLanguages.map((lang) =>
          this.scheduler.addJob('recognize', processedImage, { lang })
        )
      );

      // Find the result with highest confidence
      const bestResult = results.reduce((best, current) =>
        current.data.confidence > best.data.confidence ? current : best
      );

      return {
        text: bestResult.data.text.trim(),
        confidence: bestResult.data.confidence,
        language: bestResult.data.languages[0]?.language || 'eng',
        tables,
      };
    } catch (error) {
      console.error('Error extracting text:', error);
      return {
        text: '',
        confidence: 0,
        language: 'eng',
        tables: [],
      };
    }
  }

  private async bufferToImageElement(
    buffer: Buffer
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    });
  }

  // @ts-ignore
  private async detectObjects(imageBuffer: Buffer): Promise<any[]> {
    try {
      if (!this.objectDetectionModel) {
        // @ts-ignore
        this.objectDetectionModel = await cocoSsd.load();
      }

      // Convert buffer to image element
      const imageElement = await this.bufferToImageElement(imageBuffer);

      // Convert image element to tensor
      // @ts-ignore
      const image = await tf.browser.fromPixels(imageElement);
      const predictions = await this.objectDetectionModel.detect(image);
      tf.dispose(image);

      return predictions.map((pred: any) => ({
        class: pred.class,
        score: pred.score,
        bbox: pred.bbox,
      }));
    } catch (error) {
      console.error('Error detecting objects:', error);
      return [];
    }
  }

  // @ts-ignore
  private async detectFaces(imageBuffer: Buffer): Promise<any[]> {
    try {
      if (!this.faceDetectionModel) {
        // @ts-ignore
        this.faceDetectionModel = await blazeface.load();
      }

      // Convert buffer to image element
      const imageElement = await this.bufferToImageElement(imageBuffer);

      // Convert image element to tensor
      // @ts-ignore
      const image = await tf.browser.fromPixels(imageElement);
      const predictions = await this.faceDetectionModel.estimateFaces(image);
      tf.dispose(image);

      return predictions.map((pred: any) => ({
        confidence: pred.probability[0],
        bbox: pred.topLeft.concat(pred.bottomRight),
      }));
    } catch (error) {
      console.error('Error detecting faces:', error);
      return [];
    }
  }

  // @ts-ignore
  private async classifyImage(imageBuffer: Buffer): Promise<any[]> {
    try {
      if (!this.classificationModel) {
        // @ts-ignore
        this.classificationModel = await mobilenet.load();
      }

      // Convert buffer to image element
      const imageElement = await this.bufferToImageElement(imageBuffer);

      // Convert image element to tensor
      // @ts-ignore
      const image = await tf.browser.fromPixels(imageElement);
      const predictions = await this.classificationModel.classify(image);
      tf.dispose(image);

      return predictions;
    } catch (error) {
      console.error('Error classifying image:', error);
      return [];
    }
  }

  // @ts-ignore
  private async extractImageMetadata(
    buffer: Buffer,
    mimeType: MimeType
  ): Promise<any> {
    const metadata = await sharp(buffer).metadata();
    const exifData = await exifr.parse(buffer, {
      pick: [
        'Make',
        'Model',
        'LensModel',
        'DateTimeOriginal',
        'GPSLatitude',
        'GPSLongitude',
        'ExposureTime',
        'FNumber',
        'ISO',
        'FocalLength',
      ],
    });

    // Run all analysis in parallel
    const [objects, faces, classifications, ocrResult] = await Promise.all([
      this.detectObjects(buffer),
      this.detectFaces(buffer),
      this.classifyImage(buffer),
      this.extractText(buffer),
    ]);

    return {
      ...metadata,
      exif: exifData,
      analysis: {
        objects: objects.length > 0 ? objects : undefined,
        faces: faces.length > 0 ? faces : undefined,
        classifications:
          classifications.length > 0 ? classifications : undefined,
        text: ocrResult.text
          ? {
              content: ocrResult.text,
              confidence: ocrResult.confidence,
              language: ocrResult.language,
              tables:
                ocrResult.tables.length > 0 ? ocrResult.tables : undefined,
            }
          : undefined,
        objectCount: objects.length,
        faceCount: faces.length,
      },
    };
  }

  // @ts-ignore
  private generateImageSummary(metadata: any): string {
    const parts: string[] = [];

    // Basic image info
    parts.push(`${metadata.format.toUpperCase()} image`);
    parts.push(`${metadata.width}x${metadata.height} pixels`);

    // Color info
    if (metadata.space) {
      parts.push(`${metadata.space} color space`);
    }
    if (metadata.channels) {
      parts.push(`${metadata.channels} channels`);
    }

    // Camera info
    if (metadata.exif?.Make || metadata.exif?.Model) {
      const camera = [metadata.exif.Make, metadata.exif.Model]
        .filter(Boolean)
        .join(' ');
      parts.push(`Taken with ${camera}`);
    }

    // Location info
    if (metadata.exif?.GPSLatitude && metadata.exif?.GPSLongitude) {
      parts.push('Contains GPS coordinates');
    }

    // Analysis results
    if (metadata.analysis) {
      // Add extracted text if available
      if (metadata.analysis.text?.content) {
        const text = metadata.analysis.text.content;
        const preview =
          text.length > 100 ? text.substring(0, 100) + '...' : text;
        parts.push(
          `Contains text (${metadata.analysis.text.language}): "${preview}"`
        );

        if (metadata.analysis.text.tables?.length > 0) {
          parts.push(
            `Contains ${metadata.analysis.text.tables.length} table${
              metadata.analysis.text.tables.length > 1 ? 's' : ''
            }`
          );
        }
      }

      // Add top classification if available
      if (metadata.analysis.classifications?.length > 0) {
        const topClass = metadata.analysis.classifications[0];
        parts.push(
          `Classified as: ${topClass.className} (${Math.round(
            topClass.probability * 100
          )}% confidence)`
        );
      }

      // Add face detection results
      if (metadata.analysis.faceCount > 0) {
        parts.push(
          `Contains ${metadata.analysis.faceCount} face${
            metadata.analysis.faceCount > 1 ? 's' : ''
          }`
        );
      }

      // Add object detection results
      if (metadata.analysis.objectCount > 0) {
        const objects = metadata.analysis.objects
          .map((obj: any) => obj.class)
          .filter(
            (value: string, index: number, self: string[]) =>
              self.indexOf(value) === index
          );
        parts.push(`Detected objects: ${objects.join(', ')}`);
      }
    }

    return parts.join(' | ');
  }

  // @ts-ignore
  private formatImageMetadata(metadata: any): string {
    const lines: string[] = [];

    // Basic image info
    lines.push('Image Information:');
    lines.push(`- Format: ${metadata.format.toUpperCase()}`);
    lines.push(`- Dimensions: ${metadata.width}x${metadata.height} pixels`);
    lines.push(`- Color Space: ${metadata.space}`);
    lines.push(`- Channels: ${metadata.channels}`);

    // EXIF data
    if (metadata.exif) {
      lines.push('\nCamera Information:');
      if (metadata.exif.Make)
        lines.push(
          `- Camera: ${metadata.exif.Make} ${metadata.exif.Model || ''}`
        );
      if (metadata.exif.LensModel)
        lines.push(`- Lens: ${metadata.exif.LensModel}`);
      if (metadata.exif.DateTimeOriginal)
        lines.push(`- Taken: ${metadata.exif.DateTimeOriginal}`);
      if (metadata.exif.ExposureTime)
        lines.push(
          `- Exposure: 1/${Math.round(1 / metadata.exif.ExposureTime)}s`
        );
      if (metadata.exif.FNumber)
        lines.push(`- Aperture: f/${metadata.exif.FNumber}`);
      if (metadata.exif.ISO) lines.push(`- ISO: ${metadata.exif.ISO}`);
      if (metadata.exif.FocalLength)
        lines.push(`- Focal Length: ${metadata.exif.FocalLength}mm`);

      if (metadata.exif.GPSLatitude && metadata.exif.GPSLongitude) {
        lines.push(
          `- Location: ${metadata.exif.GPSLatitude}, ${metadata.exif.GPSLongitude}`
        );
      }
    }

    // Analysis results
    if (metadata.analysis) {
      // Add extracted text
      if (metadata.analysis.text?.content) {
        lines.push('\nExtracted Text:');
        lines.push(`- Language: ${metadata.analysis.text.language}`);
        lines.push(
          `- Confidence: ${Math.round(metadata.analysis.text.confidence)}%`
        );
        lines.push(`- Content: "${metadata.analysis.text.content}"`);

        // Add tables if available
        if (metadata.analysis.text.tables?.length > 0) {
          lines.push('\nDetected Tables:');
          metadata.analysis.text.tables.forEach(
            (table: Table, index: number) => {
              lines.push(
                `\nTable ${index + 1} (${Math.round(
                  table.confidence * 100
                )}% confidence):`
              );
              table.cells.forEach((row) => {
                const rowText = row
                  .map((cell) => cell.text.padEnd(20))
                  .join(' | ');
                lines.push(`| ${rowText} |`);
              });
            }
          );
        }
      }

      // Add classifications
      if (metadata.analysis.classifications?.length > 0) {
        lines.push('\nImage Classification:');
        metadata.analysis.classifications
          .slice(0, 3)
          .forEach((classification: any) => {
            lines.push(
              `- ${classification.className}: ${Math.round(
                classification.probability * 100
              )}% confidence`
            );
          });
      }

      // Add face detection results
      if (metadata.analysis.faces?.length > 0) {
        lines.push('\nFace Detection:');
        lines.push(
          `- Found ${metadata.analysis.faceCount} face${
            metadata.analysis.faceCount > 1 ? 's' : ''
          }`
        );
        metadata.analysis.faces.forEach((face: any, index: number) => {
          lines.push(
            `  Face ${index + 1}: ${Math.round(
              face.confidence * 100
            )}% confidence`
          );
        });
      }

      // Add object detection results
      if (metadata.analysis.objects?.length > 0) {
        lines.push('\nObject Detection:');
        const objectGroups = metadata.analysis.objects.reduce(
          (acc: any, obj: any) => {
            acc[obj.class] = (acc[obj.class] || 0) + 1;
            return acc;
          },
          {}
        );

        Object.entries(objectGroups).forEach(([className, count]) => {
          lines.push(
            `- ${className}: ${count} instance${count > 1 ? 's' : ''}`
          );
        });
      }
    }

    return lines.join('\n');
  }

  // @ts-ignore
  async parse(buffer: Buffer, mimeType: MimeType): Promise<ParsedDocument> {
    const metadata = await this.extractImageMetadata(buffer, mimeType);
    const summary = this.generateImageSummary(metadata);
    const formattedMetadata = this.formatImageMetadata(metadata);

    return {
      text: formattedMetadata,
      metadata: {
        ...metadata,
        summary,
      },
    };
  }
}
