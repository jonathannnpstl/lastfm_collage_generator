import React, { useState, useEffect, useRef } from "react";
import { validateCollageSettings } from "../../utils";
import { setCollageSettings } from "../../utils";
import Button from "../Button";
import { CollageSettings, Item, Track } from "@/utils/types";
import ErrorLoading from "./ErrorLoading";
import { fetchTracks, fetchAlbums } from "./fetchers";
import { drawCollage, } from "./drawUtils";


type Props = {
  settingsData: CollageSettings;
};

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
    type: null
};


const CollageGenerator: React.FC<Props> = ({
  settingsData,
}) => {
  const [fetchingImages, setFetchingImages] = useState<boolean>(true);
  const [items, setItems] = useState<Item[]>([])
  const [showButton, setShowButton] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const downloadCanvasRef = useRef<HTMLCanvasElement>(null);
  const [arrangement, setArrangement] = useState<string>("rank")


  const handleDownload = () => {
    const canvas = downloadCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `collage_${settings.username}_${settings.type}_${settings.row}x${settings.col}_${settings.duration}.png`; // file name
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const processItems = async () => {
    if (settingsData.type && settingsData.type === "albums") {
        fetchAlbums(settingsData).then(data => {
          if (data) {
            setItems(data)
          }
        })  
      } else if (settingsData.type && settingsData.type === "tracks") {
        fetchTracks(settingsData).then(data => {
          if (data) {
            setItems(data)
          }
        })  
      } else {
        alert("Error fetching...")
      }
  }

  useEffect(() => {
    const formValidation = validateCollageSettings(settingsData);
    if (formValidation.valid) {
      setFetchingImages(true)
      processItems()
      setFetchingImages(false)
    } else {
      alert(formValidation.message || "Invalid settings");
    }
  }, []);


   useEffect(() => {
     const previewCanvas = previewCanvasRef.current;
     const downloadCanvas = downloadCanvasRef.current;
     if (!previewCanvas && !downloadCanvas) return;

    settings = setCollageSettings(settingsData);

    if (previewCanvas) {
      drawCollage(previewCanvas, items, settings, 50, arrangement); // low quality
    }
    if (downloadCanvas) {
      drawCollage(downloadCanvas, items, settings, 300, arrangement); // high quality
    }

    setShowButton(false); // reset before showing
    const timer = setTimeout(() => setShowButton(true), 3000);
    return () => clearTimeout(timer);

  }, [items, arrangement]);
  
  return (

    <div>
      {fetchingImages ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          <p className="text-gray-600">Fetching your {settingsData.type}...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          {items.length > 0  || items.length >= settings.row * settings.col ? (
            <>
              <h2 className="text-lg font-semibold text-gray-800">
                Your collage is rendering!
              </h2>
              <p className="text-gray-500 text-sm">
                Wait until all the images have loaded before downloading.
              </p>
              <canvas ref={previewCanvasRef} className=" shadow-md" />
              <canvas ref={downloadCanvasRef} className="hidden" />
                <p className="text-gray-500 text-lg">
                  Arrange your collage by: 
                  <span className="font-bold">
                    { " " + arrangement.toUpperCase()}
                  </span>
                </p>


              {showButton && (
                <div>                 
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <Button onClick={() => setArrangement("rank")} className="px-4">Rank</Button>
                  <Button onClick={() => setArrangement("brightness")} className="px-4">Brightness</Button>
                  <Button onClick={() => setArrangement("hue")} className="px-4">Hue</Button>
                </div>
                <Button bgColor="bg-green-600 hover:bg-green-700" onClick={handleDownload}>
                  Download
                </Button>
                </div>
              )}
            </>


          ) : (
            <ErrorLoading />
          )}
        </div>
      )}

    </div>

  );
};


export default CollageGenerator;
