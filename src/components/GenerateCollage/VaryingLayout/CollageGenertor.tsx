import React, { useRef, useEffect, useState } from 'react';
import { drawCollage } from './helpers';
import { StepProps } from '@/utils/types';
import { Item } from '@/utils/types';
import { validateCollageSettings } from '@/utils';
import { fetchAlbums, fetchTracks } from '../fetchers';
import { CollageSettings } from '@/utils/types';
import ErrorLoading from '../ErrorLoading';
import LoadingImages from '@/components/LoadingImages';



interface CollageGeneratorProps {
  items: Item[];
  settingsData: CollageSettings;
}

const CollageGenerator: React.FC<CollageGeneratorProps> = ({
  items,
  settingsData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const generateCollage = async () => {
      if (!canvasRef.current || !items.length) return;

      setLoading(true);
      const canvas = canvasRef.current
      await drawCollage(canvas, settingsData.gridSize, settingsData, items)
      setLoading(false);
    };

    generateCollage();
  }, [items]);


  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {items.length > 0 && items.length >= settingsData.imageCount ? (
          <>
            {loading ? 
            <h2 className="text-lg font-semibold text-gray-800 m-0">
              Your collage is rendering...
            </h2>
           : 
           <>
            <h2 className="text-lg font-semibold text-gray-800">
              Your collage is ready!
            </h2>
            <p className="text-sm text-gray-600">Larger images are your top {settingsData.type}s</p>
            </>
            }
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
          style={{ border: '1px solid #ccc', borderRadius: '8px' }}
          className="shadow-md"
        />
      </div>
      </>
      ) : (
          <ErrorLoading />
        )}
    </div>
  );
};

const CollageVarying: React.FC<StepProps> = ({settingsData}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const processItems = async () => {
    setLoading(true);
      try {
        if (settingsData.type && settingsData.type === "albums") {
          const data = await fetchAlbums(settingsData);
          if (data) {
            setItems(data);
          }
        } else if (settingsData.type && settingsData.type === "tracks") {
          const data = await fetchTracks(settingsData);
          if (data) {
            setItems(data);
          }
        } else {
          console.log("Error fetching type...");
        }
      } catch (error) {
        console.error("Error processing items:", error);
      } finally {
      }
      setLoading(false);
    };

  useEffect(() => {

    const formValidation = validateCollageSettings(settingsData);
        if (formValidation.valid) {
          processItems();
        } else {
          alert(formValidation.message || "Invalid settings");
        }
    // const demoItems: Item[] = Array.from({ length: imagesCount }, (_, i) => ({
    //   link: `https://picsum.photos/300/200?random=${i + 1}`,
    //   title: `Image ${i + 1}`,
    // }));
  }, [settingsData]);

  if (loading) {
    return (
      <LoadingImages/>
    );
  }
  return (
      <CollageGenerator items={items} settingsData={settingsData} />
  );
};

export default CollageVarying;
