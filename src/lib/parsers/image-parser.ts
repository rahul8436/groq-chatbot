import { DocumentParser, ParsedDocument, MimeType } from './types';
// @ts-ignore
import sharp from 'sharp';
// @ts-ignore
import exifr from 'exifr';

// Only import ML libraries in development
let tf: any, cocoSsd: any, blazeface: any, mobilenet: any, tesseract: any;
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  tf = require('@tensorflow/tfjs-node'); // Use tfjs-node in development
  // @ts-ignore
  cocoSsd = require('@tensorflow-models/coco-ssd');
  // @ts-ignore
  blazeface = require('@tensorflow-models/blazeface');
  // @ts-ignore
  mobilenet = require('@tensorflow-models/mobilenet');
  // @ts-ignore
  tesseract = require('tesseract.js');
}

interface TableCell {
  text: string;
  confidence: number;
  bbox: number[];
}

interface Table {
  cells: TableCell[][];
  confidence: number;
}

export class ImageParser implements DocumentParser {
  private readonly supportedLanguages = ['eng'];
  private readonly tableDetectionThreshold = 0.7;
  private objectDetectionModel: any = null;
  private faceDetectionModel: any = null;
  private classificationModel: any = null;
  private workers: any[] = [];
  private scheduler: any = null;

  constructor() {
    // Only initialize ML features in development
    if (process.env.NODE_ENV === 'development') {
      this.initMLFeatures().catch(console.error);
    }
  }

  private async initMLFeatures() {
    try {
      if (!tf || !cocoSsd || !blazeface || !mobilenet) return;

      // Load models in parallel
      const [objectModel, faceModel, classificationModel] = await Promise.all([
        cocoSsd.load(),
        blazeface.load(),
        mobilenet.load(),
      ]);

      this.objectDetectionModel = objectModel;
      this.faceDetectionModel = faceModel;
      this.classificationModel = classificationModel;
    } catch (error) {
      console.error('Error initializing ML features:', error);
    }
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

    // Only run ML analysis in development
    let analysis = {};
    if (process.env.NODE_ENV === 'development') {
      try {
        const [objects, faces, classifications] = await Promise.all([
          this.detectObjects(buffer),
          this.detectFaces(buffer),
          this.classifyImage(buffer),
        ]);

        analysis = {
          objects: objects.length > 0 ? objects : undefined,
          faces: faces.length > 0 ? faces : undefined,
          classifications:
            classifications.length > 0 ? classifications : undefined,
          objectCount: objects.length,
          faceCount: faces.length,
        };
      } catch (error) {
        console.error('Error running ML analysis:', error);
      }
    }

    return {
      ...metadata,
      exif: exifData,
      analysis,
    };
  }

  private async detectObjects(buffer: Buffer): Promise<any[]> {
    if (!this.objectDetectionModel || process.env.NODE_ENV !== 'development') {
      return [];
    }
    try {
      const image = await tf.node.decodeImage(buffer);
      const predictions = await this.objectDetectionModel.detect(image);
      image.dispose();
      return predictions;
    } catch (error) {
      console.error('Error detecting objects:', error);
      return [];
    }
  }

  private async detectFaces(buffer: Buffer): Promise<any[]> {
    if (!this.faceDetectionModel || process.env.NODE_ENV !== 'development') {
      return [];
    }
    try {
      const image = await tf.node.decodeImage(buffer);
      const predictions = await this.faceDetectionModel.estimateFaces(image);
      image.dispose();
      return predictions;
    } catch (error) {
      console.error('Error detecting faces:', error);
      return [];
    }
  }

  private async classifyImage(buffer: Buffer): Promise<any[]> {
    if (!this.classificationModel || process.env.NODE_ENV !== 'development') {
      return [];
    }
    try {
      const image = await tf.node.decodeImage(buffer);
      const predictions = await this.classificationModel.classify(image);
      image.dispose();
      return predictions;
    } catch (error) {
      console.error('Error classifying image:', error);
      return [];
    }
  }

  private generateImageSummary(metadata: any): string {
    const parts: string[] = [];

    // Basic metadata
    if (metadata.width && metadata.height) {
      parts.push(`${metadata.width}x${metadata.height} pixels`);
    }
    if (metadata.format) {
      parts.push(metadata.format.toUpperCase());
    }
    if (metadata.exif?.Make) {
      parts.push(`Camera: ${metadata.exif.Make} ${metadata.exif.Model || ''}`);
    }

    // Only include ML analysis in development
    if (process.env.NODE_ENV === 'development' && metadata.analysis) {
      if (metadata.analysis.classifications?.length > 0) {
        const topClass = metadata.analysis.classifications[0];
        parts.push(
          `Classified as: ${topClass.className} (${Math.round(
            topClass.probability * 100
          )}% confidence)`
        );
      }
      if (metadata.analysis.faceCount > 0) {
        parts.push(
          `Contains ${metadata.analysis.faceCount} face${
            metadata.analysis.faceCount > 1 ? 's' : ''
          }`
        );
      }
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

  async parse(buffer: Buffer, mimeType: MimeType): Promise<ParsedDocument> {
    const metadata = await this.extractImageMetadata(buffer, mimeType);
    const summary = this.generateImageSummary(metadata);

    return {
      text: summary,
      metadata: {
        ...metadata,
        summary,
      },
    };
  }
}
