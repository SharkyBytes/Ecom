import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Carousel = ({ images = [], autoplayInterval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [images, autoplayInterval]);

  if (!images.length) {
    return (
      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No banners available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
      {/* Images */}
      <div className="relative h-48">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Link to={image.link}>
              <img
                src={image.image}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
