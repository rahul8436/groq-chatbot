import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'md',
  className = '',
}) => {
  // Generate a consistent color based on the name
  const getColorFromName = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];

    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full ${getColorFromName(
        name
      )} text-white font-medium ${sizeClasses[size]} ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

export default UserAvatar;
