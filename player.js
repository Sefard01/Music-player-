// Songs list
// songs folder me jo songs hai unko yaha add karo folder path hai "Songs/" array me store kro


const songs = [
    { title: "Track 1", src: "Songs/1.mp3" },
    { title: "Track 2", src: "Songs/2.mp3" },
    { title: "Track 3", src: "Songs/3.m4a" },
    { title: "Track 4", src: "Songs/4.m4a" },
    { title: "Track 5", src: "Songs/5.mp3" },
    { title: "Track 6", src: "Songs/6.mp3" },
    { title: "Track 7", src: "Songs/7.m4a" },
    { title: "Track 8", src: "Songs/8.m4a" },
    { title: "Track 9", src: "Songs/9.mp3" },
    { title: "Track 10", src: "Songs/10.mp3" },
    { title: "Track 11", src: "Songs/11.m4a" },
    { title: "Track 12", src: "Songs/12.m4a" },
    { title: "Track 13", src: "Songs/13.m4a" },
    { title: "Track 14", src: "Songs/14.mp3" },
    { title: "Track 15", src: "Songs/15.m4a" },
    { title: "Track 16", src: "Songs/16.m4a" },
    { title: "Track 17", src: "Songs/17.mp3" },
    { title: "Track 18", src: "Songs/18.m4a" },
    { title: "Track 19", src: "Songs/19.mp3" },
    { title: "Track 20", src: "Songs/20.mp3" },
    { title: "Track 21", src: "Songs/21.mp3" },
    { title: "Track 22", src: "Songs/22.m4a" },
    { title: "Track 23", src: "Songs/23.mp3" },
    { title: "Track 24", src: "Songs/24.m4a" }
];

const cover = [
    "cover/1.png",
    "cover/2.png",
    "cover/3.png",
    "cover/4.png",
    "cover/5.png",
    "cover/6.png",
    "cover/7.png",
    "cover/8.png",
    "cover/9.png",
    "cover/10.png",
    "cover/11.png",
    "cover/12.png",
    "cover/13.png",
    "cover/14.png",
    "cover/15.png"
];


let index = 0;
let audio = document.getElementById("audio");
let songTitle = document.getElementById("songTitle");
let seekBar = document.getElementById("myRange");
let time = document.getElementById("time");
let current = document.getElementById("current");
let img = document.getElementById("img");
let midBtn = document.getElementById("midBtn");

// Load first song (only if songs available)
if (songs.length > 0) {
    loadSong(index);
} else {
    // If there are no songs, disable controls or show a message (keeps existing code intact)
    console.warn("No songs found in playlist.");
}

function loadSong(i) {
    audio.src = songs[i].src;
    songTitle.innerText = songs[i].title;
    // set cover image (use modulo in case there are fewer covers than songs)
    if (img && cover.length > 0) {
        const c = cover[i % cover.length];
        img.style.backgroundImage = `url('${c}')`;
    }

    audio.addEventListener("loadedmetadata", () => {
        seekBar.max = audio.duration;
        updateTime();
    });
}

function playPause() {
    if (audio.paused) {
        audio.play();
        midBtn.classList.add("fa-circle-pause");
        midBtn.classList.remove("fa-circle-play");
        img.classList.add("ani");
    }
    else {
        audio.pause();
        midBtn.classList.add("fa-circle-play");
        midBtn.classList.remove("fa-circle-pause");
        img.classList.remove("ani");
    }
}

function nextSong() {
    index = (index + 1) % songs.length;
    loadSong(index);
    audio.play();
}

function prevSong() {
    index = (index - 1 + songs.length) % songs.length;
    loadSong(index);
    audio.play();
}

seekBar.addEventListener("input", () => {
    audio.currentTime = seekBar.value;
});

audio.addEventListener("timeupdate", () => {
    seekBar.value = audio.currentTime;
    updateTime();
});

function formatTime(sec) {
    let m = Math.floor(sec / 60);
    let s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function updateTime() {
    time.innerText = formatTime(audio.duration || 0);
    current.innerText = formatTime(audio.currentTime);

}

// Build Playlist UI
// Ensure a playlist container exists (if not present in HTML, create one)
let playlist = document.getElementById("playlist");
if (!playlist) {
    playlist = document.createElement("div");
    playlist.id = "playlist";
    document.body.appendChild(playlist);
}

songs.forEach((song, i) => {
    let div = document.createElement("div");
    div.innerText = song.title;

    div.onclick = () => {
        index = i;
        loadSong(index);
        audio.play();
    };

    playlist.appendChild(div);
});
