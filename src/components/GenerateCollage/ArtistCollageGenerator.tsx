"use client";

import React, { useState, useRef, useEffect } from "react";

type Props = {
  formData: { username: string; duration: string; row_col: number[]; showName: boolean };
};

type DiscogsArtist = {
  id: number;
  name: string;
  image: string;
};

type Artist = {
  name: string;
  mbid: string;
};

const DISCOGS_TOKEN = process.env.NEXT_PUBLIC_DISCOGS_TOKEN;

const API_KEY = process.env.NEXT_PUBLIC_LASTFM_KEY;

const ArtistCollageGenerator: React.FC<Props>  = ({
  formData,
}) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [discogsArtists, setDiscogsArtists] = useState<DiscogsArtist[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

    const fetchArtist = async () => {

    try {
        const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${formData.username}&api_key=${API_KEY}&period=${formData.duration}&limit=${(formData.row_col[0] + 1) * (formData.row_col[1] + 1)}&format=json`
        );
        const data = await res.json();
        const mapped: Artist[] = data.topartists.artist.map((item: any) => ({
            name: item.name,
            mbid: item.mbid
            
        }));

        console.log(mapped);
        
        setArtists(mapped);

    } catch (error) {
        console.error("Error fetching albums:", error);
    } finally {
    }
  };


  // Fetch Discogs image for each Last.fm artist
  const fetchDiscogsImages = async () => {
    setLoading(true);
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

          if (!match) return { id: 0, name: artist.name, image: "" };

          return {
            id: match.id,
            name: artist.name,
            image: match.cover_image || match.thumb || "",
          };
        })
      );

      console.log(responses);
      

      setDiscogsArtists(responses.filter((a) => a.image)); // keep only artists with image
    } catch (err) {
      console.error("Error fetching Discogs images:", err);
    } finally {
      setLoading(false);
    }
  };

  // Draw collage once artists are fetched
  useEffect(() => {
    // if (!artists.length) return;
    // const canvas = canvasRef.current;
    // if (!canvas) return;
    // const ctx = canvas.getContext("2d");
    // if (!ctx) return;

    // const cols = 3;
    // const rows = Math.ceil(artists.length / cols);
    // const side = 200;

    // canvas.width = cols * side;
    // canvas.height = rows * side;

    // artists.forEach((artist, idx) => {
    //   const row = Math.floor(idx / cols);
    //   const col = idx % cols;
    //   const img = new Image();
    //   img.crossOrigin = "anonymous";
    //   img.onload = () => {
    //     ctx.drawImage(img, col * side, row * side, side, side);

    //     // Overlay name
    //     ctx.fillStyle = "rgba(0,0,0,0.6)";
    //     ctx.fillRect(col * side, row * side + side - 20, side, 20);
    //     ctx.fillStyle = "white";
    //     ctx.font = "12px sans-serif";
    //     ctx.fillText(artist.name, col * side + 4, row * side + side - 6);
    //   };
    //   img.src = artist.image || "/placeholder.jpg";
    // });

    if (artists.length) {
        fetchDiscogsImages();
    } else {
        fetchArtist();
    }

  }, [artists]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold text-center">🎤 Artist Collage (Last.fm + Discogs)</h1>
      <button
        onClick={fetchArtist}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Generate Collage
      </button>

      <div className="flex justify-center mt-4">
        {loading ? <p>Loading images...</p> : <canvas ref={canvasRef} className="border shadow-md" />}
      </div>
    </div>
  );
};

export default ArtistCollageGenerator;
