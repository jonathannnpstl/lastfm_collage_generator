import React, { useRef, useEffect, useState } from 'react';
import { COLLAGE_LAYOUTS } from './layout';
import { drawCollage } from './helpers';
import { StepProps } from '@/utils/types';

interface ImageItem {
  id: string;
  link: string;
  title: string;
  rank?: number;
}

interface CollageSettings {
  showName: boolean;
  containerWidth: number;
  containerHeight: number;
}

interface CollageGeneratorProps {
  items: ImageItem[];
  settings: CollageSettings;
  gridSize: number;
}

const CollageGenerator: React.FC<CollageGeneratorProps> = ({
  items,
  settings,
  gridSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const generateCollage = async () => {
      if (!canvasRef.current || !items.length) return;

      setLoading(true);
      const canvas = canvasRef.current
      await drawCollage(canvas, gridSize, settings, items)
      setLoading(false);
    };

    generateCollage();
  }, [items, settings, gridSize]);


  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 10,
            flexDirection: 'column',
          }}
        >
          <div className="text-lg font-medium mb-2">Generating collage...</div>
        </div>
)}
      <canvas
        ref={canvasRef}
        width={settings.containerWidth}
        height={settings.containerHeight}
        style={{ border: '1px solid #ccc', borderRadius: '8px' }}
      />
    </div>
  );
};

const CollageFixed: React.FC<StepProps> = ({settingsData}) => {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [gridSize, setGridSize] = useState<number>(settingsData.gridSize);

  useEffect(() => {
    const imagesCount =
      COLLAGE_LAYOUTS[gridSize as keyof typeof COLLAGE_LAYOUTS]
        .imageCount || 10;
    const demoItems: ImageItem[] = Array.from({ length: imagesCount }, (_, i) => ({
      id: `item-${i}`,
      link: `https://picsum.photos/300/200?random=${i + 1}`,
      title: `Image ${i + 1}`,
      rank: Math.floor(Math.random() * 100),
    }));

    setItems(demoItems);
  }, [gridSize]);

  const settings: CollageSettings = {
    showName: true,
    containerWidth: 500,
    containerHeight: 500,
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Collage Generator (Predefined Layout)</h2>
      <p>Select grid size</p>
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
        }}
      >
        <div>
          <label htmlFor="gridSize">Grid Size: </label>
          <select
            id="gridSize"
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value={4}>4x4</option>
            <option value={5}>5x5</option>
            <option value={6}>6x6</option>
          </select>
        </div>
      </div>
      <CollageGenerator items={items} settings={settings} gridSize={gridSize} />
    </div>
  );
};

export default CollageFixed;
