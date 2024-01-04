let currentsong = new Audio()
let songs
let curfolder;
async function getSongs(folder) {
    curfolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    console.log(response)
    let di = document.createElement("div")
    di.innerHTML = response
    // let as = document.getElementsByTagName("a")
    let as = Array.from(di.getElementsByTagName("a"));
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //songs lists
    let songsul = document.querySelector(".songslist").getElementsByTagName("ul")[0]
    songsul.innerHTML = ""
    for (const song of songs) {
        songsul.innerHTML = songsul.innerHTML + `<li>
         <i class="fa-solid fa-music fa-sm" style="color: #ffffff;"></i>
                                 <div class="info">
                                     <div>${song.replaceAll("%20", " ").split("-")[0]}</div>
                                     <div>${song.replaceAll("%20", " ").split("-")[1].split(".")[0]}</div>
                                 </div>
                                 <div class="playnow">
                                     <span>Play now</span>
                                     <i class="fa-solid fa-play fa-lg music-icon" style="color: #ffffff;"></i>
                                 </div>
         </li>`
    }
    //adding eventlisner to each song
    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML + "-" + e.querySelector(".info").lastElementChild.innerHTML + ".mp3")
        })

    })
    return songs
}
const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return formattedTime;
}
const playmusic = (track, pause = false) => {
    // let audio = new Audio("/songs/"+track)
    currentsong.src = `/${curfolder}/` + track
    if (!pause) {
        currentsong.play()
        document.querySelector(".play").innerHTML = `<i class="fa-solid fa-pause fa-lg" style="color: #ffffff;"></i>`
    }

    document.querySelector(".songname").innerHTML = decodeURI(track)
    document.querySelector(".songduration").innerHTML = "00:00/00:00"
}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play-button-container">
                                <!-- Play button icon (triangle) -->
                                <div class="play-button"></div>
                            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])

        })
    })
}


async function main() {
    await getSongs("songs/ncs")
    playmusic(songs[0], true)
    // console.log(songs)
    // Display all the albums on the page
    await displayAlbums()
    //adding eventlisteners to the songbuttons
    let pl = document.querySelector(".play")
    pl.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            pl.innerHTML = `<i class="fa-solid fa-pause fa-lg" style="color: #ffffff;"></i>`
        }
        else {
            currentsong.pause()
            pl.innerHTML = `<i class="fa-solid fa-play fa-lg music-icon" style="color: #ffffff;"></i>`
        }
    })
    //adding eventlistner for song duration
    currentsong.addEventListener("timeupdate", () => {
        let currentTime = currentsong.currentTime;
        let duration = currentsong.duration;
        let progress = (currentTime / duration) * 100 + "%";
        const formattedCurrentTime = formatTime(currentTime);
        const formattedDuration = formatTime(duration);

        document.querySelector(".songduration").innerHTML = `${formattedCurrentTime}/${formattedDuration}`;
        document.querySelector(".circle").style.left = progress
    })
    // adding eventlistner to the seekk bar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })
    // adding eventlistner to the hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
        document.querySelector(".left").style.width = "80vw"
        document.querySelector(".top").style.width = "70vw"
        document.querySelector(".bottom").style.width = "70vw"
        document.querySelector(".lib-mid-cont").style.width = "65vw"
        document.querySelector(".songslist").style.width = "65vw"
    })
    //adding eventlistner for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })
    //adding eventlistner to the prev and next button
    document.querySelector(".prev").addEventListener("click", () => {
        console.log("prev clicked")
        // console.log(currentsong.src.split("/").slice(-1)[0])
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
        else {
            playmusic(songs[index + 1])
        }
    })
    document.querySelector(".next").addEventListener("click", () => {
        console.log("next clicked")
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
        else {
            playmusic(songs[index - 1])
        }
    })

    //adding eventlistner to show all
    let shw = document.getElementById("show")
    shw.addEventListener("click", () => {
        shw.innerText = "Back"
        document.querySelector(".playbar").style.visibility = "hidden"
    })
    shw.addEventListener("dblclick", () => {
        shw.innerText = "Show all"
        document.querySelector(".playbar").style.visibility = "visible"
    })

    //adding eventlistner to the card
    // Array.from(document.getElementsByClassName("card")).forEach((e) => {
    //     e.addEventListener("click", async (item) => {
    //         songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
    //     })
    // })
}


let mainExecuted = false;
let plus_icon = document.querySelector(".icon")
plus_icon.addEventListener("click", () => {
    plus_icon.title = "double-click, to go back!"
    plus_icon.classList.toggle('rotate');
    document.querySelector(".songslist").style.display = "none"
    if (!mainExecuted) {
        //first card
        let di_1 = document.createElement("div")
        di_1.classList.add("cont1", "crt")
        let di_1_1 = document.createElement("div")
        di_1_1.classList.add("lines")
        let head_1 = document.createElement("h3")
        head_1.textContent = "Create your first playlist"
        let sp_1 = document.createElement("span")
        sp_1.textContent = "it's easy we will help you"
        let btn_1 = document.createElement("button")
        btn_1.textContent = "Create playlist"
        btn_1.classList.add("lib-btn")
        di_1_1.appendChild(head_1)
        di_1_1.appendChild(sp_1)
        di_1.appendChild(di_1_1)
        di_1.appendChild(btn_1)

        //second card
        let di_2 = document.createElement("div")
        di_2.classList.add("cont2", "crt")
        let di_2_2 = document.createElement("div")
        di_2_2.classList.add("lines")
        let head_2 = document.createElement("h3")
        head_2.textContent = "Let's find some podcast to follow"
        let sp_2 = document.createElement("span")
        sp_2.textContent = "we will keep you posted on new episodes"
        let btn_2 = document.createElement("button")
        btn_2.textContent = "Browse Podcast"
        btn_2.classList.add("lib-btn")
        di_2_2.appendChild(head_2)
        di_2_2.appendChild(sp_2)
        di_2.appendChild(di_2_2)
        di_2.appendChild(btn_2)

        document.querySelector(".lib-mid-cont").append(di_1)
        document.querySelector(".lib-mid-cont").append(di_2)
        mainExecuted = true;
    }
    // document.querySelectorAll(".crt").forEach((e)=>{
    //     e.style.display  = "none"
    //  })
    //  if (!mainExecuted) {
    //     main();
    //     mainExecuted = true;
    // }

    //  document.querySelector(".songslist").style.height = "40vh"
    // document.querySelector(".songslist").style.display = "block"
})
plus_icon.addEventListener("dblclick", () => {
    plus_icon.classList.toggle('rotate');
    plus_icon.title = "click, to create your playlist"
    document.querySelectorAll(".crt").forEach((e) => {
        e.remove(); // Remove the created divs
    });

    mainExecuted = false;
    document.querySelector(".songslist").style.display = "block";
})
main()
