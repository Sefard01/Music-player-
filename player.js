// Songs list
const songs = [
    { title: "Chal Tere isq me", src: "1.m4a" },
    { title: "Aaj Ki Raat", src: "2.m4a" }
];

let index = 0;
let audio = document.getElementById("audio");
let songTitle = document.getElementById("songTitle");
let seekBar = document.getElementById("myRange");
let time = document.getElementById("time");
let current = document.getElementById("current");
let img = document.getElementById("img");
let midBtn = document.getElementById("midBtn");

// Load first song
loadSong(index);

function loadSong(i) {
    audio.src = songs[i].src;
    songTitle.innerText = songs[i].title;

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
