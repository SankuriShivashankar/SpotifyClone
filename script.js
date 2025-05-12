const currentsong = new Audio();
let songs;
let currentfolder;

const formattime = (time) => {
  const minutes = Math.floor(time / 60).toString().padStart(2, "0");
  const seconds = Math.floor(time % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

async function getSongs(folder) {
  currentfolder = folder;
  let a = await fetch(`${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  let songList = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songList.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  return songList;
}

const play = document.querySelector(".play");

const playmusic = (track, pause = false) => {
  if (!track) {
    console.error("No track provided to playmusic");
    return;
  }
  currentsong.src = `${currentfolder}/` + decodeURIComponent(track);
  if (!pause) {
    currentsong.play();
    play.src = "images/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track
    ? track.replaceAll("%20", " ").slice(0, 15)
    : "";

  localStorage.setItem("currentSong", track);
};

async function displayAlbums() {
  let a = await fetch("songs");
  let response = await a.text();
  let div = document.createElement('div');
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");

  let b2 = document.querySelector(".b2");
  for (const e of anchors) {
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      try {
        let a = await fetch(`songs/${folder}/info.json`);
        let response = await a.json();
        b2.innerHTML += `
          <div data-folder="${folder}" class="card">
            <div class="image">
              <img src="/songs/${folder}/cover.jpeg">
            </div>
            <div class="hContainer">
              <span class="h1">${response.title}</span>
              <div class="h2">${response.description}</div>
            </div>
          </div>`;
      } catch (err) {
        console.warn(`Could not load info.json for folder: ${folder}`);
      }
    }
  }

  // Attach event listeners after cards are loaded
  Array.from(document.getElementsByClassName("card")).forEach(element => {
    element.addEventListener('click', async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);

      let songlistElem = document.querySelector(".songlists ul");
      songlistElem.innerHTML = "";
      for (const song of songs) {
        songlistElem.innerHTML += `
          <li>
            <img src="images/music-note-03-stroke-rounded.svg" alt="">
            <div data-song="${song}">${song.replaceAll("%20", " ").slice(0, 15)}</div>
            <div>shiva</div>
            <div class="playnow">
              <span>play now</span>
              <img class="playbutton" src="images/play.svg" width="22px">
            </div>
          </li>`;
      }

      Array.from(songlistElem.getElementsByTagName("li")).forEach((element) => {
        element.addEventListener("click", () => {
          const songName = element.querySelector("div").dataset.song;
          playmusic(songName.trim());
        });
      });

      if (songs.length > 0) {
        playmusic(songs[0]);
      }
    });
  });
}

async function main() {
  songs = await getSongs("songs/fav");
  await displayAlbums();

  const savedSong = localStorage.getItem("currentSong");
  if (savedSong) {
    playmusic(savedSong, true);
  } else {
    playmusic(songs[0], true);
  }

  let songlist = document.querySelector(".songlists ul");
  songlist.innerHTML = "";
  for (const song of songs) {
    songlist.innerHTML += `
      <li>
        <img src="images/music-note-03-stroke-rounded.svg" alt="">
        <div data-song="${song}">${song.replaceAll("%20", " ").slice(0, 15)}</div>
        <div>shiva</div>
        <div class="playnow">
          <span>play now</span>
          <img class="playbutton" src="images/play.svg" width="22px">
        </div>
      </li>`;
  }

  Array.from(songlist.getElementsByTagName("li")).forEach((element) => {
    element.addEventListener("click", () => {
      const songName = element.querySelector("div").dataset.song;
      playmusic(songName.trim());
    });
  });

  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "images/pause.svg";
    } else {
      currentsong.pause();
      play.src = "images/play.svg";
    }
  });

  currentsong.addEventListener("timeupdate", () => {
    const CurrentTime = formattime(currentsong.currentTime);
    const totalDuration = formattime(currentsong.duration);
    document.querySelector(".songduration").textContent = `${CurrentTime}/${totalDuration}`;
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let result = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = result + "%";
    currentsong.currentTime = (currentsong.duration * result) / 100;
  });

  document.querySelector(".hamburger").addEventListener('click', () => {
    document.querySelector(".leftbox").style.left = 0;
  });

  document.querySelector(".cross").addEventListener('click', () => {
    document.querySelector(".leftbox").style.left = "-100%";
  });
}

main();
