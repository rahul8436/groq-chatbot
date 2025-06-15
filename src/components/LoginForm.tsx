'use client';

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { FaUser } from 'react-icons/fa';

export default function LoginForm() {
  const [name, setName] = useState('');
  const { login } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name.trim());
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white'>
            Welcome to CoderHelper
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600 dark:text-gray-400'>
            Please enter your name to continue
          </p>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='rounded-md shadow-sm -space-y-px'>
            <div>
              <label htmlFor='name' className='sr-only'>
                Your Name
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaUser className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='name'
                  name='name'
                  type='text'
                  required
                  className='appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='Your Name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type='submit'
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
