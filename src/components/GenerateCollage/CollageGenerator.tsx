import React, { useState, useEffect, useRef } from "react";
import { validateCollageSettings } from "../../utils";
import { setCollageSettings } from "../../utils";
import Button from "../Button";

type Props = {
  formData: { username: string; duration: string; row_col: number[]; showName: boolean };
};

type Album = {
  link: string;
  title: string;
};

let settings: { 
    username: string,
    duration: string,
    row: number,
    col: number,
    showName: boolean
} = {
    username: "",
    duration: "7day",
    row: 0,
    col: 0,
    showName: false
};

const API_KEY = process.env.NEXT_PUBLIC_LASTFM_KEY;

const ErrorLoading: React.FC = () => {
  const errors = [
    "No existing user found.",
    "Insufficient albums fetched.",
    "Connection issues.",
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-lg font-semibold text-red-600 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-600 mb-3">Possible reasons are the following:</p>
      <ul className="text-gray-500 text-sm list-disc list-inside space-y-1">
        {errors.map((err, idx) => (
          <li key={idx}>{err}</li>
        ))}
      </ul>
      <Button bgColor="bg-red-600 hover:bg-red-700 mt-6" onClick={() => window.location.reload()} >Try Again</Button>
    </div>
  );
};


const CollageGenerator: React.FC<Props> = ({
  formData,
}) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [fetchingImages, setFetchingImages] = useState<boolean>(true);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const downloadCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const fetchAlbums = async () => {

    try {
      setFetchingImages(true);
      const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${formData.username}&api_key=${API_KEY}&period=${formData.duration}&limit=${(formData.row_col[0] + 1) * (formData.row_col[1] + 1)}&format=json`
      );
      const data = await res.json();
      const mapped: Album[] = data.topalbums.album.map((item: any) => ({
          link: item.image[3]["#text"] || item.image[2]["#text"], // large size image
          title:`${item.artist.name} – ${item.name}`

        }));

      console.log(mapped);
        
      setAlbums(mapped);

    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setFetchingImages(false);
    }
  }

  const handleDownload = () => {
    const canvas = downloadCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `collage_${settings.username}_albums_${settings.row}x${settings.col}_${settings.duration}.png`; // file name
    link.href = canvas.toDataURL("image/png");
    link.click();
  };


  function printName(
    ctx: CanvasRenderingContext2D,
    i: number, // column index
    j: number, // row index
    title: string,
    sideLength: number,
    overlay: boolean = false
  ) {
    ctx.textAlign = "center";

    // Font size scales with cell size and title length
    const fontSize = Math.min(
      (sideLength * 1.3) / title.length,
      sideLength / 15
    );
    ctx.font = `${fontSize}pt sans-serif`;

    const textX = i * sideLength + sideLength / 2;
    let textY;

    ctx.save();

    if (overlay) {
      // Draw background rectangle first
      const bgHeight = sideLength / 8; // ~12% of cell
      const bgY = j * sideLength + sideLength - bgHeight;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(i * sideLength, bgY, sideLength, bgHeight);

      // Shadow for better readability
      ctx.shadowBlur = 5;
      ctx.shadowColor = "#2b2b2b";
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = "white";
      ctx.textBaseline = "bottom";
      textY = j * sideLength + sideLength - sideLength / 30;
    } else {
      ctx.fillStyle = "white";
      ctx.textBaseline = "middle";
      textY = j * sideLength + sideLength / 2;
    }

    ctx.fillText(title, textX, textY);
    ctx.restore();
  }

  const drawCollage = async (
    canvas: HTMLCanvasElement,
    albums: Album[],
    settings: ReturnType<typeof setCollageSettings>,
    maxCanvasSize: number
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const side = maxCanvasSize === 300 ? 300 : Math.floor(maxCanvasSize / Math.max(settings.col, settings.row));

    canvas.width = settings.col * side * dpr;
    canvas.height = settings.row * side * dpr;
    canvas.style.width = `${settings.col * side}px`;
    canvas.style.height = `${settings.row * side}px`;
    ctx.scale(dpr, dpr);

    const promises = albums.map((album, idx) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const row = Math.floor(idx / settings.col);
          const col = idx % settings.col;

          ctx.drawImage(img, col * side, row * side, side, side);
          if (settings.showName) {
            printName(ctx, col, row, album.title, side, true);
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = album.link || "/placeholder.jpg";
      });
    });

    await Promise.all(promises);

  };


  useEffect(() => {
    const formValidation = validateCollageSettings(formData);

    if (formValidation.valid) {      
      fetchAlbums();
    } else {
      alert(formValidation.message || "Invalid settings");
    }
  }, [formData.username, formData.duration, formData.row_col]);


   useEffect(() => {
     const previousCanvas = previewCanvasRef.current;
     const downloadCanvas = downloadCanvasRef.current;
     if (!previousCanvas && !downloadCanvas) return;

    settings = setCollageSettings(formData);

    // if (previousCanvas) {
    //   drawCollage(previousCanvas, albums, settings, 600); // low quality
    // }
    if (downloadCanvas) {
      drawCollage(downloadCanvas, albums, settings, 300); // high quality
    }


  }, [albums, formData]);
  
  return (

    <div>
      {fetchingImages ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          <p className="text-gray-600">Fetching your top albums...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          {albums.length > 0  || albums.length >= settings.row * settings.col ? (
            <>
              <h2 className="text-lg font-semibold text-gray-800 m-4">
                Your collage is ready!
              </h2>
              {/* <canvas ref={previewCanvasRef} className="border shadow-md" /> */}
              <canvas ref={downloadCanvasRef} className="hidden" />

              <Button bgColor="bg-green-600 hover:bg-green-700" onClick={handleDownload} >Download</Button>
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
