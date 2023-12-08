let currentAudioElement = null;

document.addEventListener('DOMContentLoaded', function () {
    const apiKey = '454d47bb48msh2980ec16166ade4p189a32jsnf46d556bd4f3';

    const style = document.createElement('style');
    style.innerHTML = `
        .song {
            display: inline-block;
            width: calc(33.33% - 20px);
            margin: 10px;
            box-sizing: border-box;
        }

        .song img {
            max-width: 100%;
            height: auto;
        }

        .song-details {
            padding: 10px;
            text-align: center;
            background-color: #f5f5f5;
            border-radius: 5px;
        }

        .play-button {
            background-color: #3498db;
            color: #fff;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
        }
    `;

    document.head.appendChild(style);

    async function searchMusic(query) {
        const searchUrl = `https://youtube-music-api3.p.rapidapi.com/search?q=${encodeURIComponent(query)}&type=song`;

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'youtube-music-api3.p.rapidapi.com',
            },
        };

        try {
            const response = await fetch(searchUrl, options);
            const result = await response.json();

            // Clear previous search results
            const searchResultsContainer = document.getElementById('searchResults');
            searchResultsContainer.innerHTML = '';

            // Loop through the results and create HTML elements
            result.result.forEach(song => {
                const songElement = document.createElement('div');
                songElement.classList.add('song');
                songElement.innerHTML = `
                    <center><img src="${song.thumbnail}" alt="${song.title}"></center>
                    <div class="song-details">
                        <h3>${song.title}</h3>
                        <p>${song.author}</p>
                        <p>Duration: ${song.duration}</p>
                        <button class="play-button" data-video-id="${song.videoId}">Play</button>
                    </div>
                `;

                // Add click event listener to play the song
                songElement.querySelector('.play-button').addEventListener('click', function () {
                    const videoId = this.getAttribute('data-video-id');
                    playSong(videoId, songElement);
                });

                searchResultsContainer.appendChild(songElement);
            });

        } catch (error) {
            console.error(error);
        }
    }

    async function playSong(videoId, songElement) {
        // Stop the currently playing song and hide its audio element
        stopCurrentSong();
    
        const url = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '7519adc043msh53cfe9cd313f109p124924jsne59d0f368b0d',
                'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
            }
        };
    
        try {
            const response = await fetch(url, options);
            const result = await response.json();
    
            if (result.status === 'ok') {
                // Extract the song link
                const songLink = result.link;
    
                // Play the song on the website
                playAudio(songLink, songElement);
            } else {
                console.error('Failed to fetch song link');
            }
        } catch (error) {
            console.error(error);
        }
    }
    

    function playAudio(songLink, songElement) {
        // Create an audio element
        const audioElement = document.createElement('audio');
        audioElement.style.width = '100%'; // Set the width to 100%
    audioElement.style.position = 'fixed';
    audioElement.style.bottom = '0'; // Stick to the bottom
    audioElement.style.left = '0';
    audioElement.style.zIndex = '999';
        audioElement.controls = true;
        audioElement.setAttribute('data-video-id', songElement.querySelector('.play-button').getAttribute('data-video-id'));
        // Create a source element with the song link
        const sourceElement = document.createElement('source');
        sourceElement.src = songLink;
        sourceElement.type = 'audio/mp3';

        // Append the source element to the audio element
        audioElement.appendChild(sourceElement);

        // Find the container with the play button (within the current songElement)
        const playButtonContainer = songElement.querySelector('.song-details');
        if (playButtonContainer) {
            // Append the audio element to the container
            playButtonContainer.appendChild(audioElement);

            // Play the audio
            audioElement.play();

            // Hide the existing play button
            const playButton = playButtonContainer.querySelector('.play-button');
            if (playButton) {
                playButton.style.display = 'none';
            } else {
                console.error('Play button not found within container with class "song-details".');
            }

            // Save the current audio element for later control
            currentAudioElement = audioElement;

            // Listen for the "ended" event to show the play button again when the song finishes
            audioElement.addEventListener('ended', function () {
                if (playButtonContainer) {
                    // Show the play button again
                    const playButton = playButtonContainer.querySelector('.play-button');
                    if (playButton) {
                        playButton.style.display = 'block';
                    }
                }
                // Remove the audio element
                audioElement.parentNode.removeChild(audioElement);
                currentAudioElement = null;
            });
        } else {
            console.error('Container with class "song-details" not found.');
        }
    }

    function stopCurrentSong() {
        // If there is a currently playing song
        if (currentAudioElement) {
            // Pause the audio
            currentAudioElement.pause();
    
            // Check if the audio element has a parent node before removing it
            if (currentAudioElement.parentNode) {
                // Find the corresponding play button and show it
                const videoId = currentAudioElement.getAttribute('data-video-id');
                const playButton = document.querySelector(`.play-button[data-video-id="${videoId}"]`);
    
                if (playButton) {
                    playButton.style.display = 'inline-block';
                }
    
                // Remove the audio element
                currentAudioElement.parentNode.removeChild(currentAudioElement);
                currentAudioElement = null;
            }
        }
    }    

    document.getElementById('searchForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const searchInput = document.getElementById('searchbar');
        if (searchInput) {
            searchMusic(searchInput.value);
        } else {
            console.error('Element with ID "searchbar" not found.');
        }
    });
});
