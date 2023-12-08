let currentAudioElement = null;

document.addEventListener('DOMContentLoaded', function () {
    const style = document.createElement('style');
    style.innerHTML = `
        .fe-box {
            position: relative;
        }

        .play-button {
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #3498db;
            color: #fff;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .fe-box:hover .play-button {
            opacity: 1;
        }
    `;

    document.head.appendChild(style);

    // Event listener for the click event on the play button
    document.addEventListener('click', function (event) {
        const playButton = event.target.closest('.play-button');
        if (playButton) {
            const videoId = playButton.closest('.fe-box').getAttribute('data-video-id');
            const feBox = playButton.closest('.fe-box');
            playSong(videoId, feBox);
        }
    });
});

async function playSong(videoId, feBox) {
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
            playAudio(songLink, feBox);
        } else {
            console.error('Failed to fetch song link');
        }
    } catch (error) {
        console.error(error);
    }
}

function playAudio(songLink, feBox) {
    // Create an audio element
    const audioElement = document.createElement('audio');
   audioElement.style.width = '100%'; // Set the width to 100%
    audioElement.style.position = 'fixed';
    audioElement.style.bottom = '0'; // Stick to the bottom
    audioElement.style.left = '0';
    audioElement.style.zIndex = '999'; // Adjust the z-index as needed
    audioElement.controls = true;
    audioElement.setAttribute('data-video-id', feBox.getAttribute('data-video-id'));
    // Create a source element with the song link
    const sourceElement = document.createElement('source');
    sourceElement.src = songLink;
    sourceElement.type = 'audio/mp3';

    // Append the source element to the audio element
    audioElement.appendChild(sourceElement);

    // Append the audio element to the fe-box container
    feBox.appendChild(audioElement);

    // Create the play button dynamically
    const playButton = document.createElement('button');
    playButton.className = 'play-button';
    playButton.textContent = 'Play';
    
    // Add click event listener to play button
    playButton.addEventListener('click', function () {
        audioElement.play();
        playButton.style.display = 'none';
    });

    // Append the play button to the fe-box container
    feBox.appendChild(playButton);

    // Save the current audio element for later control
    currentAudioElement = audioElement;

    // Listen for the "ended" event to show the play button again when the song finishes
    audioElement.addEventListener('ended', function () {
        // Show the play button again
        playButton.style.display = 'block';

        // Remove the audio element
        audioElement.parentNode.removeChild(audioElement);
        currentAudioElement = null;
    });
}

function stopCurrentSong() {
    // If there is a currently playing song
    if (currentAudioElement) {
        // Pause the audio
        currentAudioElement.pause();

        // Check if the audio element has a parent node before removing it
        if (currentAudioElement.parentNode) {
            // Show the corresponding play button
            const videoId = currentAudioElement.getAttribute('data-video-id');
            const playButton = document.querySelector(`.fe-box[data-video-id="${videoId}"] .play-button`);
            if (playButton) {
                playButton.style.display = 'block';
            }

            // Remove the audio element
            currentAudioElement.parentNode.removeChild(currentAudioElement);
            currentAudioElement = null;
        }
    }
}
