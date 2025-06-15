import React from 'react';
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaTimes,
} from 'react-icons/fa';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'info' | 'success';
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle className='text-yellow-500' />;
      case 'info':
        return <FaInfoCircle className='text-blue-500' />;
      case 'success':
        return <FaCheckCircle className='text-green-500' />;
      default:
        return <FaExclamationTriangle className='text-yellow-500' />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 transition-opacity' aria-hidden='true'>
          <div className='absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75'></div>
        </div>

        <div className='inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
          <div className='absolute top-0 right-0 pt-4 pr-4'>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-500 focus:outline-none'
            >
              <FaTimes className='h-6 w-6' />
            </button>
          </div>

          <div className='bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
            <div className='sm:flex sm:items-start'>
              <div className='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10'>
                {getIcon()}
              </div>
              <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                <h3 className='text-lg leading-6 font-medium text-gray-900 dark:text-gray-100'>
                  {title}
                </h3>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
            <button
              type='button'
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${getButtonColor()} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
              onClick={onConfirm}
            >
              Confirm
            </button>
            <button
              type='button'
              className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
