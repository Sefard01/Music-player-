// Songs list
const songs = [
    { title: "Song 1", src: "1.m4a" },
    { title: "Song 2", src: "2.m4a" },
    { title: "Song 3", src: "1.m4a" }
];

let index = 0;
let audio = document.getElementById("audio");
let songTitle = document.getElementById("songTitle");
let seekBar = document.getElementById("seekBar");
let time = document.getElementById("time");
let playlist = document.getElementById("playlist");

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
    if (audio.paused) audio.play();
    else audio.pause();
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
    time.innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration || 0)}`;
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
