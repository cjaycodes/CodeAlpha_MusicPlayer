const clientId = "3d20dd14a64a42449d6e6760f072ee6e";
const clientSecret = "30bf6e217b244df3b9c381d92690a178";

// Encode credentials for browser
const authString = btoa(`${clientId}:${clientSecret}`);

// Fetch token dynamically
async function getToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

// Search song/artist
async function searchSong(userInput) {
    const token = await getToken(); // Fetch token dynamically
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(userInput)}&type=artist,track,album`;

    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    console.log(data);

    const artist = data.artists?.items[0];
    if (!artist) {
        document.getElementById("results").innerHTML = "No artist found";
        return;
    }

    const artistId = artist.id;

    // Spotify top tracks
    const tracksUrl = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`;
    const response1 = await fetch(tracksUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataTrack = await response1.json();
    console.log(dataTrack);

    // iTunes search using artist name (more reliable)
    const artistNameForItunes = encodeURIComponent(artist.name);
    const itunesUrl = `https://itunes.apple.com/search?term=${artistNameForItunes}&entity=song&limit=10`;
    const itunesResponse = await fetch(itunesUrl);
    const itunesData = await itunesResponse.json();
    console.log(itunesData);

    // Build track cards
    const tracksHTML = itunesData.results.map(result => {
        const trackName = result.trackName;
        const trackArtist = result.artistName;
        const trackImages = result.artworkUrl100;
        const highResImage = trackImages.replace('100x100bb', '300x300bb');
        const previewUrl = result.previewUrl || "";
 

        const buttonHTML = previewUrl
            ? `<button onclick="playPreview('${previewUrl}')">▶</button>`
            : `<button disabled>▶</button>`;


           return `
           <div class="track-card">
           <img src ="${highResImage}">
           <h3>${trackName}-${trackArtist}</h3>
           ${buttonHTML}
           </div>`       
        ;
    }).join("");
    

    const artistImageUrl = artist.images[0]?.url || "";
    const highResArtistImage = artistImageUrl ? artistImageUrl.replace('100x100bb', '300x300bb') : "";

     const results = document.getElementById("results");
    results.innerHTML = `
        <img src="${highResArtistImage}" alt="${artist.name}">
        <h2>${artist.name}</h2>
        <h3>Top Tracks:</h3>
        ${tracksHTML}
    `
  ;
  }
/*function addToPlaylist(highResImage, trackName,trackArtist, buttonHTML){
 const playlistDiv = document.querySelector(".playlist")
 const playListitem = document.createElement("div")
 const img = document.createElement("img")
 img.src= highResImage
 const trackname = document.createElement("p")
 trackname.textContent= trackName
 const trackartist = document.createElement("p")
 trackartist.textContent = trackArtist
const trackButton = document.createElement("button")
trackButton.innerHTML = buttonHTML

playListitem.appendChild(img)
playListitem.appendChild(trackname)
playListitem.appendChild(trackartist)
playListitem.appendChild(trackButton)

             playlistDiv.appendChild(playListitem)
          }
   

  const trackCard = document.querySelectorAll(".track-card")
       trackCard.forEach((card) => {
    const plusButton = document.createElement("button");
    plusButton.textContent = "+"
    plusButton.addEventListener("click", () => {
      addToPlaylist(highResImage, trackName,trackArtist, buttonHTML);
      card.appendChild(plusButton)
    })        
  })
    */

 



// Play preview function
function playPreview(previewUrl) {
    const player = document.getElementById("player");
    if (!previewUrl) {
        alert("Preview not available for this track");
        return;
    }
    player.src = previewUrl;       
    player.style.display = "block"; 
    player.play();                  
}

const input = document.getElementById("searchInput");
const searchBtn = document.getElementById("btn");
searchBtn.addEventListener("click", function() {
    const userInput = input.value.trim();
    if (!userInput) return;
    searchSong(userInput);
});
