import React, { useRef, useEffect, useState } from 'react';
import { drawCollage } from './helpers';
import { StepProps } from '@/utils/types';
import { Item } from '@/utils/types';
import { validateCollageSettings } from '@/utils';
import { fetchAlbums, fetchTracks } from '../fetchers';
import { CollageSettings } from '@/utils/types';
import ErrorLoading from '../ErrorLoading';
import LoadingImages from '@/components/LoadingImages';
import Button from '@/components/Button';;

interface CollageGeneratorProps {
  items: Item[];
  settingsData: CollageSettings;
}

const CollageGenerator: React.FC<CollageGeneratorProps> = ({
  items,
  settingsData,
}) => {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  const handleDownload = () => {
     if (!previewCanvasRef.current) return;
      previewCanvasRef.current.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `collage_${settingsData.username}_${settingsData.type}_${settingsData.gridSize}_${settingsData.duration}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
      }, 'image/png', 1);
  };

  const generateCollage = async () => {
      if (!previewCanvasRef.current || !items.length) return;

      setLoading(true);
      const canvas = previewCanvasRef.current;
      if (canvas) {
      await drawCollage(canvas, settingsData, items)
      }
      setLoading(false);
    };

  
  useEffect(() => {
    generateCollage();
  });


  return (
    <div className="flex flex-col items-center justify-center">
      {items.length > 0 && items.length >= settingsData.imageCount ? (
          <>
            {loading ? 
            <h2 className="text-lg font-semibold text-gray-800">
              Your collage is rendering...
            </h2>
           : 
           <>
            <h2 className="text-lg font-semibold text-gray-800">
              Your collage is ready!
            </h2>
            <p className="text-sm text-gray-600 mb-4">Larger images are your top {settingsData.type}</p>
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
          ref={previewCanvasRef}
          style={{ border: '1px solid #ccc', borderRadius: '8px' }}
          className="shadow-md"
        />

          <Button onClick={generateCollage} className='mt-4'>
            Regenerate
          </Button>
         <Button 
            bgColor="bg-green-600 hover:bg-green-700" 
            onClick={handleDownload}
            disabled={loading}
            className='mt-4'
              >
              {loading ? "Loading..." : "Download"}
          </Button>
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
  const didFetch = useRef(false);

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
     if (didFetch.current) return; // already ran once
    didFetch.current = true;

    const formValidation = validateCollageSettings(settingsData);
        if (formValidation.valid) {
          processItems();
        } else {
          alert(formValidation.message || "Invalid settings");
        }
  });

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
