import React, { useState, useEffect, useRef } from "react";
import { validateCollageSettings } from "../../../utils";
import { setCollageSettings } from "../../../utils";
import Button from "../../Button";
import { CollageSettings, Item, Track } from "@/utils/types";
import ErrorLoading from "../ErrorLoading";
import { fetchTracks, fetchAlbums } from "../fetchers";
import { drawCollage } from "./helpers";
import { StepProps } from "@/utils/types";


type CollageGeneratorProps = {
  settingsData: CollageSettings;
  items: Item[];
}

let settings: {
  username: string;
  duration: string;
  row: number;
  col: number;
  showName: boolean;
  type: "tracks" | "albums" | null;
} = {
  username: "",
  duration: "7day",
  row: 0,
  col: 0,
  showName: false,
  type: null,
};

const CollageGenerator: React.FC<CollageGeneratorProps> = ({ settingsData, items }) => {
  const [fetchingImages, setFetchingImages] = useState<boolean>(true);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const downloadCanvasRef = useRef<HTMLCanvasElement>(null);
  const [arrangement, setArrangement] = useState<string>("rank");
  const [imagesLoaded, setImagesLoaded] = useState<number>(0);

  const handleDownload = () => {
    const canvas = downloadCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `collage_${settings.username}_${settings.type}_${settings.row}x${settings.col}_${settings.duration}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  useEffect(() => {
    const generateCollage = async () => {
      setFetchingImages(true);
      setImagesLoaded(0);
      
      const previewCanvas = previewCanvasRef.current;
      const downloadCanvas = downloadCanvasRef.current;
      if (!previewCanvas && !downloadCanvas) return;

      settings = setCollageSettings(settingsData);

      if (previewCanvas) {
        await drawCollage(previewCanvas, items, settings, 50, arrangement);
      }
      if (downloadCanvas) {
        await drawCollage(downloadCanvas, items, settings, 300, arrangement);
      }
      
      setFetchingImages(false);
    };

    generateCollage();
  }, [items, arrangement]);

  return (
    <div>
      <div className="flex flex-col items-center justify-center space-y-4">
        {items.length > 0 || items.length >= settings.row * settings.col ? (
          <>
            {fetchingImages ? 
            <h2 className="text-lg font-semibold text-gray-800">
              Your collage is rendering...
            </h2>
           : 
            <h2 className="text-lg font-semibold text-gray-800">
              Your collage is ready!
            </h2>
            }
            <div className="relative">
              {fetchingImages && (
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
              <canvas ref={previewCanvasRef} className="shadow-md" />
            </div>
            <canvas ref={downloadCanvasRef} className="hidden" />
            <p className="text-gray-500 text-lg">
              Arrange your collage by: 
              <span className="font-bold">
                { " " + arrangement.toUpperCase()}
              </span>
            </p>
            <div>                 
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Button onClick={() => setArrangement("rank")} className="px-4">Rank</Button>
                <Button onClick={() => setArrangement("brightness")} className="px-4">Brightness</Button>
                <Button onClick={() => setArrangement("hue")} className="px-4">Hue</Button>
              </div>
              <Button 
                bgColor="bg-green-600 hover:bg-green-700" 
                onClick={handleDownload}
                disabled={fetchingImages}
              >
                {fetchingImages ? "Loading..." : "Download"}
              </Button>
            </div>
          </>
        ) : (
          <ErrorLoading />
        )}
      </div>
    </div>
  );
};

const CollageFixed: React.FC<StepProps> = ({ settingsData }) => {
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
        console.log("Error fetching...");
      }
    } catch (error) {
      console.error("Error processing items:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const formValidation = validateCollageSettings(settingsData);
    if (formValidation.valid) {
      processItems();
    } else {
      alert(formValidation.message || "Invalid settings");
    }
  }, [settingsData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-lg font-medium mb-4">Loading your data...</div>
        <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  return <CollageGenerator items={items} settingsData={settingsData} />;
};

export default CollageFixed;