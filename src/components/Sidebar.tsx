'use client';

import React from 'react';

const Sidebar = () => {
  return (
    <aside className='w-64 bg-gray-900 p-4 flex flex-col'>
      <div className='mb-4'>
        <h1 className='text-2xl font-bold'>ChatGPT</h1>
      </div>
      <nav className='flex-grow'>
        <ul>
          <li className='mb-2'>
            <a href='#' className='block p-2 rounded hover:bg-gray-800'>
              New chat
            </a>
          </li>
          {/* Add more sidebar items here */}
        </ul>
      </nav>
      <div className='mt-auto'>
        <button className='w-full p-2 rounded bg-gray-800 hover:bg-gray-700'>
          Add Team workspace
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
