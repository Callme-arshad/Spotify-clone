let currentSong = new Audio();
let songs;
let currFolder;
let isPlaying = true;


// responsive login and signup button 
document.querySelector(".login").addEventListener("click",()=>{
    window.location.href = 'https://accounts.spotify.com/en/login?continue=https%3A%2F%2Fopen.spotify.com%2F';
})
document.querySelector(".signup").addEventListener("click",()=>{
    window.location.href = 'https://www.spotify.com/jp/signup?forward_url=https%3A%2F%2Fopen.spotify.com%2F';
})
// Function to convert seconds to MM:SS format
function convertSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(remainingSeconds).padStart(2, '0');
    return `${minutesStr}:${secondsStr}`;
}

// Function to fetch songs from the server
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + ` <li><img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", "")}</div>
                                <div>by codex</div>
                            </div>
                            <div class="playnow">
                                <span>play now</span>
                                <img  class="invert" src="play.svg" alt="">
                            </div>
                        </li>`;
    }

    // Attach event listeners to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            document.querySelector('#play').src = 'pause.svg';


        });
    });
    return songs
}

// Function to play music
const playMusic = (track, play = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!play) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".song_info").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = (e.href.split("/").slice(-2)[0]);
            //get the metadata of folder 
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML =  cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#000"
                                xmlns="http://www.w3.org/200/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/naat.png" alt="">
                        <h2>${response.tittle}</h2>
                        <p>${response.discription}</p>
                    </div> `
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
            document.querySelector('#play').src = 'pause.svg';
        });
    });

}

// Main function
async function main() {
    await getSongs(`songs/cs`);
    playMusic(songs[0], true);

    //display all album on page 
    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSeconds(currentSong.currentTime)} / ${convertSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 98.5 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 98.5;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
            play.src = "pause.svg";
        } else if (index == 0) {
            playMusic(songs[0]);
            play.src = "pause.svg";
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < 4) {
            playMusic(songs[index + 1]);
            play.src = "pause.svg";
        }else if (index==4){
            playMusic(songs[4])
        }
    });


}

// Keyboard event listener for play/pause and song navigation
document.addEventListener('keydown', function (event) {
    if (event.key === ' ' || event.key === 'Spacebar') {
        if (isPlaying) {
            currentSong.pause();
            play.src = "play.svg";
        } else {
            currentSong.play();
            play.src = "pause.svg";
        }
        isPlaying = !isPlaying;
    }
    if (event.key === 'ArrowRight') {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
            play.src = "pause.svg";
        }
    } else if (event.key === 'ArrowLeft') {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
            play.src = "pause.svg";
        } else if (index == 0) {
            playMusic(songs[0]);
            play.src = "pause.svg";
        }
    }
});

main();
