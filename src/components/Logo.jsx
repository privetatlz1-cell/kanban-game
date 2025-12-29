import React from 'react';

const Logo = ({ size = 'default' }) => {
  const sizes = {
    small: { padding: 'px-4 py-2', fontSize: 'text-lg' },
    default: { padding: 'px-6 py-3', fontSize: 'text-xl' },
    large: { padding: 'px-8 py-4', fontSize: 'text-2xl' },
  };

  const sizeClasses = sizes[size] || sizes.default;

  return (
    <div
      className={`inline-flex items-center justify-center rounded ${sizeClasses.padding} ${sizeClasses.fontSize} font-bold text-white`}
      style={{
        backgroundColor: '#EC6428',
        fontFamily: 'Montserrat, sans-serif',
        letterSpacing: '0.5px',
      }}
    >
      АБЗ Дорстрой
    </div>
  );
};

export default Logo;

