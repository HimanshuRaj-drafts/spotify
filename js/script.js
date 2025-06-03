console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

// to cahnge the time format
function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}


async function getSongs(folder) {
  currFolder = folder
  let a = await fetch(`http://192.168.29.47:3000/${folder}/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let as = div.getElementsByTagName("a")
  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  }




  // Show all the songs in the playlist
  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
  songUL.innerHTML = ""
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")} </div>
                                <div>Himanshu</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                               <img class="invert" src="img/play.svg" alt="">
                            </div></li>`;
  }

  // Attach an event listner to each song
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

    })
  })

  return songs

}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track
  if (!pause) {
    currentSong.play()
    play.src = "img/pause.svg"
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
  let a = await fetch(`http://192.168.29.47:3000/songs/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = (e.href.split("/").slice(-2)[0])
      // Get the meta data of the folder
      let a = await fetch(`http://192.168.29.47:3000/songs/${folder}/info.json`)
      let response = await a.json();
      console.log(response)
      cardContainer.innerHTML = cardContainer.innerHTML + `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                                <!-- Circular green background -->
                                <circle cx="24" cy="24" r="24" fill="#1ed760" />

                                <!-- Visually centered (slightly right-shifted) filled black play icon -->
                                <path d="M18.5 16V32L32.5 24L18.5 16Z" fill="black" />
                            </svg>

                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
    }

  }
  // load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])

    })
  })

  document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })
})



}


async function main() {
  // Get the list of all the songs
  await getSongs("songs/favs")
  playMusic(songs[0], true)

  // display all the albums on the screen
  displayAlbums()

  // Atttach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play()
      play.src = "img/pause.svg"
    }
    else {
      currentSong.pause()
      play.src = "img/play.svg"
    }
  })

  // Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  })

  // Add an evemt listner for seek bar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
  })

  // Add event listner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })

  // Add event listner for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
  })



  // Add an event listner to previous 
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if (index - 1 >= 0) {
      playMusic(songs[index - 1])
    }
  })

  // Add an event listner to next
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1])
    }
  })

  // Add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("Setting volume to", e.target.value, "/ 100");
    currentSong.volume = parseInt(e.target.value) / 100
  })

  // add event listner to mute the track
  document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg")
      currentSong.volume = .1;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  })

}


main()