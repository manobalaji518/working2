document.addEventListener("DOMContentLoaded", () => {
  const webcamElement = document.getElementById("webcam");

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        webcamElement.srcObject = stream;
      })
      .catch((error) => {
        console.error("Webcam access denied:", error);
      });
  } else {
    console.error("Webcam not supported in this browser.");
  }
});

const accessToken = localStorage.getItem("ACCESS_TOKEN");

console.log(accessToken);

document.getElementById("detectEmotion").addEventListener("click", () => {
  const detectedEmotion = "Sad"; // Replace this with actual emotion detection logic
  // fetchSongsByEmotion(detectedEmotion);
  fetchSongsByEmotion(detectedEmotion);
});

const emotionGenres = {
  Happy: ["pop", "dance", "house"],
  Sad: ["acoustic", "folk", "blues"], //"singer-songwriter"
  Angry: ["rock", "metal", "hardcore", "punk", "heavy-metal"],
  Surprised: ["alternative", "experimental", "indie-pop", "dubstep"],
  Fearful: ["dark-ambient", "industrial", "soundtrack", "post-rock"],
  Disgusted: ["grunge", "garage-rock", "noise", "punk"],
  Neutral: ["lo-fi", "chill", "jazz", "classical", "ambient"],
};

// first function
async function fetchSongsByEmotion(emotion) {
  if (!emotionGenres[emotion]) {
    console.error("Emotion not recognized.");
    return;
  }

  const genres = emotionGenres[emotion].join(",");
  const url = `https://api.spotify.com/v1/search?q=genre%3A${encodeURIComponent(genres)}&type=track`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Replace with actual token
        "Content-Type": "application/json",
      },
    });
    console.log(response);

    if (!response.ok) {
      throw new Error("Failed to fetch songs");
    }

    const data = await response.json();
    // console.log(data.tracks);
    displaySongs(data.tracks.items);
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

// Second function

// async function fetchUserSpecificSongsByEmotion(emotion) {
//   if (!emotionGenres[emotion]) {
//     console.error("Emotion not recognized.");
//     return [];
//   }

//   const genres = emotionGenres[emotion].join(",");

//   try {
//     // Step 1: Fetch User's Top Tracks

//     const topTracksResponse = await fetch(
//       "https://api.spotify.com/v1/me/top/tracks",
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//         params: {
//           time_range: "short_term", // can be short_term, medium_term, long_term
//           limit: 5, // get top 5 tracks to use as seeds
//         },
//       }
//     );

//     if (!topTracksResponse.ok) {
//       throw new Error("Failed to fetch user's top tracks");
//     }
//     const topTracksData = await topTracksResponse.json();
//     console.log(topTracksData);
//     const seedTrackIds = topTracksData.items.map((track) => track.id);

//     // Step 2: Get Recommendations Based on Top Tracks and Emotion Genres
//     const recommendationsResponse = await fetch(
//       `https://api.spotify.com/v1/recommendations?` +
//         `seed_tracks=${seedTrackIds.join(",")}` +
//         `&seed_genres=${encodeURIComponent(genres)}` +
//         `&limit=20`, // number of recommended tracks
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (!recommendationsResponse.ok) {
//       throw new Error("Failed to fetch recommendations");
//     }

//     const recommendationsData = await recommendationsResponse.json();

//     // Display or return the tracks
//     displaySongs(filteredTracks);
//   } catch (error) {
//     console.error("Error fetching user-specific songs:", error);
//     return [];
//   }
// }

//******************************************/

// function displaySongs(tracks) {
//   console.log(tracks);

//   const songContainer = document.getElementById("song-list");
//   songContainer.innerHTML = ""; // Clear previous results

//   tracks.forEach((track) => {
//     const songItem = document.createElement("div");
//     songItem.classList.add("song");

//     songItem.innerHTML = `
//             <img src="${track.album.images[0].url}" alt="${track.name}" />
//             <div class="song-info">
//                 <h3>${track.name}</h3>
//                 <p>${track.artists.map((artist) => artist.name).join(", ")}</p>
//             </div>
//             <span class="duration">${formatDuration(track.duration_ms)}</span>

//         `;

//     songContainer.appendChild(songItem);
//   });
// }

//display songs new start;;

let currentTrackIndex = 0;
let currentTracks = [];
let isPlaying = false;

function displaySongs(tracks) {
  console.log(tracks);
  currentTracks = tracks;
  const songContainer = document.getElementById("song-list");
  songContainer.innerHTML = ""; // Clear previous results

  tracks.forEach((track, index) => {
    const songItem = document.createElement("div");
    songItem.classList.add("song");
    songItem.innerHTML = `
      <img src="${track.album.images[0].url}" alt="${track.name}" />
      <div class="song-info">
          <h3>${track.name}</h3>
          <p>${track.artists.map((artist) => artist.name).join(", ")}</p>
      </div>
      <span class="duration">${formatDuration(track.duration_ms)}</span>
    `;
    songItem.addEventListener("click", () => playSong(index));
    songContainer.appendChild(songItem);
  });

  updatePlayerUI();
}

function playSong(index) {
  currentTrackIndex = index;
  isPlaying = true;
  updatePlayerUI();
}

function updatePlayerUI() {
  const player = document.getElementById("music-player");
  if (!currentTracks.length) return;

  const track = currentTracks[currentTrackIndex];
  player.innerHTML = `
    <div class="player-info">
      <img src="${track.album.images[0].url}" alt="${track.name}" />
      <div>
        <h3>${track.name}</h3>
        <p>${track.artists.map((artist) => artist.name).join(", ")}</p>
      </div>
    </div>
    <div class="player-controls">
      <button onclick="prevSong()">⏮</button>
      <button onclick="togglePlayPause()">${isPlaying ? "⏸" : "⏵"}</button>
      <button onclick="nextSong()">⏭</button>
    </div>
  `;
}

function prevSong() {
  if (currentTrackIndex > 0) {
    playSong(currentTrackIndex - 1);
  }
}

function nextSong() {
  if (currentTrackIndex < currentTracks.length - 1) {
    playSong(currentTrackIndex + 1);
  }
}

function togglePlayPause() {
  isPlaying = !isPlaying;
  updatePlayerUI();
  console.log(isPlaying ? "Playing" : "Paused");
}

// Ensure functions are globally accessible
window.togglePlayPause = togglePlayPause;
window.nextSong = nextSong;
window.prevSong = prevSong;

//display songs new end;;;

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, "0")}`;
}
