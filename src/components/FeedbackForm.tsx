import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import emailjs from '@emailjs/browser';

interface FeedbackFormProps {
  onClose: () => void;
}

export default function FeedbackForm({ onClose }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: '',
  });
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Initialize EmailJS
    emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // First, validate the form data on the server
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to validate feedback');
      }

      const { emailData } = await response.json();

      // Send email using EmailJS browser SDK
      const result = await emailjs.send(
        emailData.service_id,
        emailData.template_id,
        emailData.template_params,
        emailData.user_id
      );

      if (result.status !== 200) {
        throw new Error('Failed to send feedback');
      }

      setStatus('success');
      setFormData({ name: '', email: '', feedback: '' });
      setTimeout(onClose, 2000); // Close after 2 seconds on success
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong'
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            Send Feedback
          </h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          >
            ×
          </button>
        </div>

        {status === 'success' ? (
          <div className='text-center py-4'>
            <div className='text-green-500 text-lg mb-2'>
              Thank you for your feedback!
            </div>
            <p className='text-gray-600 dark:text-gray-300'>
              We appreciate your input.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Name
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
                placeholder='Your name'
              />
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Email
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
                placeholder='your.email@example.com'
              />
            </div>

            <div>
              <label
                htmlFor='feedback'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Feedback
              </label>
              <textarea
                id='feedback'
                name='feedback'
                value={formData.feedback}
                onChange={handleChange}
                required
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
                placeholder='Share your thoughts, suggestions, or report any issues...'
              />
            </div>

            {status === 'error' && (
              <div className='text-red-500 text-sm'>{errorMessage}</div>
            )}

            <button
              type='submit'
              disabled={status === 'loading'}
              className='w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {status === 'loading' ? (
                <>
                  <FaSpinner className='animate-spin -ml-1 mr-2 h-4 w-4' />
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane className='-ml-1 mr-2 h-4 w-4' />
                  Send Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
