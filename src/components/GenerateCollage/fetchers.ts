import { Item, Track, CollageSettings } from "@/utils/types";
import { DEFAULT_IMAGE, DELAY_MS } from "@/utils/constants";
import { sleep } from "@/utils";

const API_KEY = process.env.NEXT_PUBLIC_LASTFM_KEY;
const DISCOGS_TOKEN = process.env.NEXT_PUBLIC_DISCOGS_TOKEN;

export const fetchTracks = async (settingsData: CollageSettings) => {

    try {
        const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${settingsData.username}&api_key=${API_KEY}&period=${settingsData.duration}&limit=${settingsData.imageCount}&format=json`
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const mapped: Track[] = data.toptracks.track.map((item: any) => ({
            artist: item.artist.name,
            title: item.name,
            mbid: item.mbid
        }));

        return await fetchTracksImages(mapped);
    } catch (error) {
        console.error("Error fetching artist", error);
        return []
    }
  };

export const fetchTracksImages = async (tracks: Track[]) => {
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

            if (!searchRes.ok) {
              throw new Error(`HTTP error! status: ${searchRes.status}`);
            }
            const searchData = await searchRes.json();
            const match = searchData.track?.album;

            if (!match) return { title: track.title, link: DEFAULT_IMAGE };

            if (!(searchData.track?.album.image[3]["#text"] || searchData.track?.album.image[2]["#text"])){
              const r =  await fetchDiscogTrackImage(track.title, track.artist)
              console.log(r);
              
            }

          
            return {
              title: track.title,
              link: searchData.track?.album.image[3]["#text"] || searchData.track?.album.image[2]["#text"] || await fetchDiscogTrackImage(track.title, track.artist)  || DEFAULT_IMAGE// large size image
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
      return filtered;
    } catch (err) {
      console.error("Error fetching track images:", err);
      return []
    }
}

export const fetchArtists = async (settingsData: CollageSettings) => {
    try {
      const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${settingsData.username}&api_key=${API_KEY}&period=${settingsData.duration}&limit=${settingsData.imageCount}&format=json`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const mapped: Item[] = data.topalbums.album.map(async (item: any) => ({
          link: item.image[3]["#text"] || item.image[2]["#text"] || await fetchDiscogTrackImage(item.name, item.artist.name) || DEFAULT_IMAGE, // large size image
          title:`${item.artist.name}`
        }));

      console.log(mapped);
    return mapped

    } catch (error) {
      console.error("Error fetching albums:", error);
      return []
    } 
}


export const fetchAlbums = async (settingsData: CollageSettings) => {
    try {
      const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${settingsData.username}&api_key=${API_KEY}&period=${settingsData.duration}&limit=${settingsData.imageCount}&format=json`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const mapped: Item[] = data.topalbums.album.map((item: any) => ({
          link: item.image[3]["#text"] || item.image[2]["#text"] || DEFAULT_IMAGE, // large size image
          title:`${item.artist.name} – ${item.name}`
        }));

      console.log(mapped);
    return mapped

    } catch (error) {
      console.error("Error fetching albums:", error);
      return []
    } 
}

const fetchDiscogTrackImage = async (title: string, artist: string) => {
    let result = null;
    try {
        const res = await fetch(
            `https://api.discogs.com/database/search?q=${encodeURIComponent(
                title
            )}&artist=${encodeURIComponent(artist)}&token=${DISCOGS_TOKEN}`
        );
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const searchData = await res.json();
        console.log(title, artist);
        console.log(searchData);
        
        const match = searchData.results?.[0];

        if (match) {
            result = match.cover_image || match.thumb || null;
        }
    } catch (err) {
        console.error("Error fetching Discogs images:", err);
    } finally {
        return result; // This will return either the image URL or null
    }
};



export const fetchDiscogsImages = async (artists : { name: string; mbid: string; }[]) => {
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
      return filtered;
    } catch (err) {
      console.error("Error fetching Discogs images:", err);
    }
  };

export const isUsernameExists = async (username: string) => {
    try {
      const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${username}&api_key=${API_KEY}&format=json`)

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      } 
      console.log("User found.");
      return true
    } catch (error) {
      console.log("No user found.", error);
      return false
    }
}