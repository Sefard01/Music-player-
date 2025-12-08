// Songs list
// songs folder me jo songs hai unko yaha add karo folder path hai "Songs/" array me store kro


const songs = [
    { title: "Apna Har Din", src: "Songs/1.mp3" },
    { title: "Thar", src: "Songs/2.mp3" },
    { title: "Makhna", src: "Songs/3.mp3" },
    { title: "Temporary Pyar", src: "Songs/4.mp3" },
    { title: "O Mere Dil Ke Chain", src: "Songs/5.mp3" },
    { title: "Dekha Ek Khwab", src: "Songs/6.mp3" },
    { title: "Jab Koi Baat", src: "Songs/7.mp3" },
    { title: "Yeh Ratein Yeh Mausham", src: "Songs/8.mp3" },
    { title: "Gutt Te Paranda", src: "Songs/9.mp3" },
    { title: "Shape", src: "Songs/10.mp3" },
    { title: "Ajj Ki Raat", src: "Songs/11.mp3" },
    { title: "Chal Tere Ishq me", src: "Songs/12.mp3" }
];

const cover = [
    "cover/1.png",
    "cover/2.jpeg",
    "cover/3.png",
    "cover/4.jpeg",
    "cover/5.png",
    "cover/6.png",
    "cover/7.png",
    "cover/8.png",
    "cover/9.jpeg",
    "cover/10.jpeg",
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
// When a song ends, automatically play the next one
if (audio) {
    audio.addEventListener('ended', () => {
        // reuse existing nextSong() logic
        if (songs.length > 0) nextSong();
    });
}

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
    // attach playlist to the nav so it "comes out" from the navbar
    const navEl = document.querySelector('.nav');
    if (navEl) {
        // ensure nav is positioned so the absolute playlist is placed relative to it
        const navStyle = window.getComputedStyle(navEl);
        if (navStyle.position === 'static') navEl.style.position = 'relative';
        navEl.appendChild(playlist);
        // let CSS handle the dropdown styling; add a class to the element
        playlist.classList.add('playlist-dropdown');
    } else {
        document.body.appendChild(playlist);
        playlist.classList.add('playlist-dropdown');
    }
}

// Toggle playlist visibility when navbar 3-strip (.fa-bars) is clicked
const navToggle = document.querySelector('.fa-bars');
if (navToggle) {
    navToggle.addEventListener('click', () => {
        // toggle a visible class; CSS controls visibility and transitions
        playlist.classList.toggle('visible');
    });
}

songs.forEach((song, i) => {
    // build playlist item with thumbnail and title
    let item = document.createElement("div");
    item.className = 'playlist-item';

    let thumb = document.createElement("div");
    thumb.className = 'thumb';
    if (cover.length > 0) {
        const c = cover[i % cover.length];
        thumb.style.backgroundImage = `url('${c}')`;
    }

    let title = document.createElement("div");
    title.className = 'title';
    title.innerText = song.title;

    item.appendChild(thumb);
    item.appendChild(title);

    item.onclick = () => {
        index = i;
        loadSong(index);
        audio.play();
    };

    playlist.appendChild(item);
});





