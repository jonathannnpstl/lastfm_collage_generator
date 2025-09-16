import React, { useState, useEffect, useRef } from "react";
import { validateCollageSettings } from "../../utils";
import { setCollageSettings } from "../../utils";
import Button from "../Button";
import { CollageSettings, Item, Track } from "@/utils/types";
import { DEFAULT_IMAGE, DELAY_MS } from "@/utils/constants";
import { sleep } from "@/utils";


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

const API_KEY = process.env.NEXT_PUBLIC_LASTFM_KEY;
const DISCOGS_TOKEN = process.env.NEXT_PUBLIC_DISCOGS_TOKEN;

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
  settingsData,
}) => {
  const [fetchingImages, setFetchingImages] = useState<boolean>(true);
  const [items, setItems] = useState<Item[]>([])

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const downloadCanvasRef = useRef<HTMLCanvasElement>(null);

  const fetchTracks = async () => {

    try {
        setFetchingImages(true);
        const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${settingsData.username}&api_key=${API_KEY}&period=${settingsData.duration}&limit=${(settingsData.row_col[0] + 1) * (settingsData.row_col[1] + 1)}&format=json`
        );
        const data = await res.json();
        const mapped: Track[] = data.toptracks.track.map((item: any) => ({
            artist: item.artist.name,
            title: item.name,
            mbid: item.mbid
        }));

        await fetchTracksImages(mapped);
        setFetchingImages(false);
        // setItems(tracks || []);

    } catch (error) {
        console.error("Error fetching artist", error);
    } finally {
      setFetchingImages(false);
    }
  };

  const fetchTracksImages = async (tracks: Track[]) => {
    console.log("Fetching track images..." + tracks.length);
    
    const BATCH_SIZE = 40; //for rate limiting
    
    let allResults: { title: string; link: string }[] = [];

    try {
      for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
        const batch = tracks.slice(i, i + BATCH_SIZE);

        const responses = await Promise.all(
          batch.map(async (track) => {
            const searchRes = await fetch(
              `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(track.artist)}&track=${encodeURIComponent(track.title)}&format=json`
            );
            const searchData = await searchRes.json();
            const match = searchData.track?.album;

            if (!match) return { title: track.title, link: DEFAULT_IMAGE };

            return {
              title: track.title,
              link: searchData.track?.album.image[3]["#text"] || searchData.track?.album.image[2]["#text"] || DEFAULT_IMAGE, // large size image
            };
          })
        );

        allResults = allResults.concat(responses);

        // Wait 2 seconds before next batch, unless this is the last batch
        if (i + BATCH_SIZE < tracks.length) {
          await sleep(DELAY_MS);
        }
      }

      const filtered = allResults.filter((a) => a.link);
      setItems(filtered);
      return filtered;
    } catch (err) {
      console.error("Error fetching track images:", err);
    } finally {
      setFetchingImages(false);
    }
  }

  const fetchDiscogsImages = async (artists : { name: string; mbid: string; }[]) => {
    try {
      const responses = await Promise.all(
        artists.map(async (artist) => {
          const searchRes = await fetch(
            `https://api.discogs.com/database/search?q=${encodeURIComponent(
              artist.name
            )}&type=artist&token=${DISCOGS_TOKEN}`
          );
          const searchData = await searchRes.json();
          const match = searchData.results?.[0];

          if (!match) return { title: artist.name, link: "" };

          return {
            title: artist.name,
            link: match.cover_image || match.thumb || "",
          };
        })
      );

      const filtered = responses.filter((a) => a.link);
      setItems(filtered);
      return filtered;
    } catch (err) {
      console.error("Error fetching Discogs images:", err);
    } finally {
      setFetchingImages(false)
    }
  };
  
  const fetchAlbums = async () => {
    try {
      setFetchingImages(true);
      const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${settingsData.username}&api_key=${API_KEY}&period=${settingsData.duration}&limit=${(settingsData.row_col[0] + 1) * (settingsData.row_col[1] + 1)}&format=json`
      );
      const data = await res.json();
      const mapped: Item[] = data.topalbums.album.map((item: any) => ({
          link: item.image[3]["#text"] || item.image[2]["#text"] || DEFAULT_IMAGE, // large size image
          title:`${item.artist.name} – ${item.name}`

        }));

      console.log(mapped);
        
      setItems(mapped);

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
    link.download = `collage_${settings.username}_${settings.type}_${settings.row}x${settings.col}_${settings.duration}.png`; // file name
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
    items: Item[],
    settings: ReturnType<typeof setCollageSettings>,
    maxCanvasSize: number
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const side = maxCanvasSize;

    canvas.width = settings.col * side * dpr;
    canvas.height = settings.row * side * dpr;
    canvas.style.width = `${settings.col * side}px`;
    canvas.style.height = `${settings.row * side}px`;
    ctx.scale(dpr, dpr);

    const promises = items.map((item, idx) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const row = Math.floor(idx / settings.col);
          const col = idx % settings.col;

          ctx.drawImage(img, col * side, row * side, side, side);
          if (settings.showName) {
            printName(ctx, col, row, item.title, side, true);
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = item.link || DEFAULT_IMAGE;
      });
    });

    await Promise.all(promises);
    await sleep(DELAY_MS);

  };


  useEffect(() => {
    const formValidation = validateCollageSettings(settingsData);

    if (formValidation.valid) {
      if (settingsData.type && settingsData.type === "albums") {
        fetchAlbums();
      } else if (settingsData.type && settingsData.type === "tracks") {
        fetchTracks();
      } else {
        alert("Error fetching...")
      }
    } else {
      alert(formValidation.message || "Invalid settings");
    }
  }, [settingsData]);


   useEffect(() => {
     const previewCanvas = previewCanvasRef.current;
     const downloadCanvas = downloadCanvasRef.current;
     if (!previewCanvas && !downloadCanvas) return;

    settings = setCollageSettings(settingsData);

    if (previewCanvas) {
      drawCollage(previewCanvas, items, settings, 50); // low quality
    }
    if (downloadCanvas) {
      drawCollage(downloadCanvas, items, settings, 300); // high quality
    }


  }, [items]);
  
  return (

    <div>
      {fetchingImages ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          <p className="text-gray-600">Fetching your top {settingsData.type}...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          {items.length > 0  || items.length >= settings.row * settings.col ? (
            <>
              <h2 className="text-lg font-semibold text-gray-800 m-4">
                Your collage is ready!
              </h2>
              <canvas ref={previewCanvasRef} className="border shadow-md" />
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
