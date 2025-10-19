import React from 'react';

interface YogaLoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'breathing' | 'flowing' | 'namaste';
}

const YogaLoader: React.FC<YogaLoaderProps> = ({ 
  message = "Finding your zen...", 
  size = 'medium',
  type = 'breathing'
}) => {
  const renderBreathingLoader = () => (
    <div className={`yoga-loader breathing-loader ${size}`}>
      <div className="breathing-circle-loader">
        <div className="inner-circle">
          <div className="lotus-center">🧘‍♀️</div>
        </div>
      </div>
      <div className="loader-message">{message}</div>
    </div>
  );

  const renderFlowingLoader = () => (
    <div className={`yoga-loader flowing-loader ${size}`}>
      <div className="flow-container">
        <div className="flowing-pose pose-1">🧘‍♀️</div>
      </div>
      <div className="loader-message">{message}</div>
    </div>
  );

  const renderNamasteLoader = () => (
    <div className={`yoga-loader namaste-loader ${size}`}>
      <div className="namaste-container">
        <div className="rotating-om">🕉️</div>
      </div>
      <div className="loader-message">{message}</div>
    </div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'breathing':
        return renderBreathingLoader();
      case 'flowing':
        return renderFlowingLoader();
      case 'namaste':
        return renderNamasteLoader();
      default:
        return renderBreathingLoader();
    }
  };

  return (
    <div className="yoga-loader-overlay">
      {renderLoader()}
    </div>
  );
};

export default YogaLoader;