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

// --- IndexedDB cache for offline support ---
const DB_NAME = 'music_player_cache_v1';
const STORE_NAME = 'resources';
let dbPromise = null;

function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (ev) => {
            const db = ev.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    return dbPromise;
}

async function getBlob(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const st = tx.objectStore(STORE_NAME);
        const r = st.get(key);
        r.onsuccess = () => resolve(r.result || null);
        r.onerror = () => reject(r.error);
    });
}

async function putBlob(key, blob) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const st = tx.objectStore(STORE_NAME);
        const r = st.put(blob, key);
        r.onsuccess = () => resolve(true);
        r.onerror = () => reject(r.error);
    });
}

// keep objectURL cache to avoid recreating blobs every time
const objectUrlCache = new Map();
function createObjectURLForKey(key, blob) {
    if (objectUrlCache.has(key)) return objectUrlCache.get(key);
    const url = URL.createObjectURL(blob);
    objectUrlCache.set(key, url);
    return url;
}

async function getCachedUrl(key, fallbackUrl) {
    try {
        const blob = await getBlob(key);
        if (blob) return createObjectURLForKey(key, blob);
    } catch (e) {
        console.warn('IDB get failed', key, e);
    }
    return fallbackUrl;
}

// Fetch and cache resource if missing
async function fetchAndCache(key, url) {
    try {
        const existing = await getBlob(key);
        if (existing) return true;
    } catch (e) {
        // continue to fetch
    }
    try {
        const resp = await fetch(url, { mode: 'no-cors' });
        if (!resp || !resp.ok) {
            // some servers may not allow CORS; try without checking ok by reading blob
            const b = await resp.blob();
            await putBlob(key, b);
            return true;
        }
        const blob = await resp.blob();
        await putBlob(key, blob);
        return true;
    } catch (err) {
        console.warn('fetch/cache failed', url, err);
        return false;
    }
}

// Cache all songs and covers in background (non-blocking)
function cacheAllResources() {
    // run after a small delay so UI can render
    setTimeout(() => {
        // cache songs
        songs.forEach((s) => fetchAndCache(s.src, s.src));
        // cache covers
        cover.forEach((c) => fetchAndCache(c, c));
    }, 1000);
}

// Register Service Worker for offline app shell + media caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('ServiceWorker registered:', reg.scope))
            .catch(err => console.warn('ServiceWorker registration failed:', err));
    });
}



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
    // initial load (do not autoplay)
    loadSong(index).catch((e) => console.warn('initial load failed', e));
    // start background caching of resources
    if ('indexedDB' in window) cacheAllResources();
} else {
    console.warn("No songs found in playlist.");
}

// loadSong now uses cached resources when available
async function loadSong(i) {
    if (!audio) return;
    const song = songs[i];
    if (!song) return;
    songTitle && (songTitle.innerText = song.title);

    // try to use cached blob url for audio
    try {
        const audioUrl = await getCachedUrl(song.src, song.src);
        // assign src only when resolved
        audio.src = audioUrl;
    } catch (e) {
        audio.src = song.src;
    }

    // set cover image (use cached URL when available)
    if (img && cover.length > 0) {
        const cpath = cover[i % cover.length];
        try {
            const coverUrl = await getCachedUrl(cpath, cpath);
            img.style.backgroundImage = `url('${coverUrl}')`;
        } catch (e) {
            img.style.backgroundImage = `url('${cpath}')`;
        }
    }

    // ensure seekBar max will be updated when metadata loads
    const onMeta = () => {
        seekBar.max = audio.duration;
        updateTime();
        audio.removeEventListener('loadedmetadata', onMeta);
    };
    audio.addEventListener('loadedmetadata', onMeta);
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

async function nextSong() {
    if (songs.length === 0) return;
    index = (index + 1) % songs.length;
    await loadSong(index);
    try { await audio.play(); } catch (e) {}
}

async function prevSong() {
    if (songs.length === 0) return;
    index = (index - 1 + songs.length) % songs.length;
    await loadSong(index);
    try { await audio.play(); } catch (e) {}
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

    item.onclick = async () => {
        index = i;
        await loadSong(index);
        try { await audio.play(); } catch (e) {}
    };

    playlist.appendChild(item);
});





