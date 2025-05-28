// this will likely need to be updated any time the gateway gets recreated, which is... not ideal
// const apiGatewayUrl = "https://gms9t124k8.execute-api.us-east-1.amazonaws.com/primary_api_gateway_stage/KotlinLambda"
const apiGatewayUrl = "https://api.azrinsler.com/KotlinLambda"
const ipifyUrl = "https://api.ipify.org?format=json"

async function updateVisitDetails () {
    let ip_address = await getIP()
    setDisplayedIP(ip_address)
    let [new_address, prior_visits] = await putIpToDynamoDB(ip_address)
    updateVisitCounter(new_address, prior_visits)
}

function setDisplayedIP (ip_address) {
    document.getElementById("display-ip").textContent = ip_address
}

function updateVisitCounter (isNew, visits) {
    // keeps the ip-info div hidden until and until we have content to populate it with
    if (isNaN(visits)) {
        document.getElementById("ip-info").classList.add("hidden")
    }
    else {
        document.getElementById("previous-visits").textContent = visits
        if (isNew) {
            document.getElementById("new-ip").classList.remove("hidden")
            document.getElementById("visit-counter").classList.add("hidden")
        }
        else {
            document.getElementById("new-ip").classList.add("hidden")
            document.getElementById("visit-counter").classList.remove("hidden")
        }
        document.getElementById("ip-info").classList.remove("hidden")
    }
}

async function getIP () {
    // fetch creates a promise returning from the input url
    return await fetch(ipifyUrl)
        // with subsequent .then calls used to transform the returned response
        .then(response => response.json() )
        .then(json => json.ip)
        .catch(e => console.error("Failed to fetch IP:", e))
}

async function putIpToDynamoDB (ip_address) {
    return await fetch(
        apiGatewayUrl, {
            // we need an abnormally long timeout in case the lambda hasn't been called recently (long cold-start time)
            signal: AbortSignal.timeout(120 * 1000), // specified in millis
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": apiGatewayUrl
            },
            body: JSON.stringify({ "ip_address": ip_address })
        })
        .then(response => response.json())
        .then(json => {
            console.log(json)
            let priorVisits = parseInt(json.prior_visits)
            let isNew = json.new_address === "true"
            return [isNew, priorVisits]
        })
}

// default is dark mode so this really just checks for light mode and updates if necessary
function checkForLightMode () {
    console.log("Checking if light mode is enabled")
    let isDarkMode = localStorage.getItem("isDarkMode")
    if (isDarkMode !== "true") {
        console.log("Dark mode is disabled. Switching to light.")
        let elements = document.getElementsByClassName("dark")
        for (let i = elements.length - 1; i >= 0; i--) {
            let element = elements.item(i)
            element.classList.toggle("light")
            element.classList.toggle("dark")
        }
    }
    else {
        console.log("Dark mode is enabled. Good choice!")
    }
}

function toggleMode () {
    // uses local storage to track dark mode between pages
    let isDarkMode = localStorage.getItem("isDarkMode")
    if (isDarkMode == null) {
        console.log("isDarkMode not found in local storage - defaulting to true")
        isDarkMode = true
    }
    else {
        console.log("isDarkMode found in local storage. Current value: " + isDarkMode)
        isDarkMode = isDarkMode === "true"
    }
    console.log("Current value of isDarkMode (to be toggled) is: " + isDarkMode)

    let elements = document.getElementsByClassName(isDarkMode ? "dark" : "light")

    isDarkMode = !isDarkMode

    if (isDarkMode) console.log("Toggling dark elements to light")
    else            console.log("Toggling light elements to dark")

    console.log("Elements to be toggled:")
    console.log(elements)

    // this iterates backwards because accessing elements in-order causes the weirdness with "live" Collections
    for (let i = elements.length - 1; i >= 0; i--) {
        let element = elements.item(i)
        element.classList.toggle("light")
        element.classList.toggle("dark")
    }
    localStorage.setItem("isDarkMode", isDarkMode.toString())
}

function matchWidth (thisElement, thatElement) {
    console.log("Attempting to match width of '#" + thisElement + "' to that of '#" + thatElement + "'")
    let source = document.getElementById(thisElement)
    let target = document.getElementById(thatElement).offsetWidth //.getBoundingClientRect()
    let targetWidth = target.toString() + "px"
    console.log("Source width: " + source.getBoundingClientRect().width.toString())
    console.log("Target width: " + targetWidth)
    source.style.width = targetWidth
}

function togglePopoutMenu () {
    let popoutMenuContent = document.getElementById("popout-menu-content")
    let isClosed = popoutMenuContent.classList.contains("invisible")
    let isMobile = /Mobi|Android/i.test(navigator.userAgent)

    if (isClosed) {
        let popoutMenu = document.getElementById("popout-menu")
        if (isMobile) {
            console.log("Opening mobile popout menu")
            popoutMenuContent.style.width = "100%"
            popoutMenu.style.width = "100vw"
        }
        else {
            console.log("Opening desktop popout menu")
            popoutMenuContent.style.width = "fit-content"
            let menuWidth = popoutMenuContent.offsetWidth
            popoutMenu.style.width = menuWidth + "px"
        }
        popoutMenu.style.backgroundColor = "dimgray"
        popoutMenu.style.borderRight = "3px solid"
        document.getElementById("popout-menu-button").style.transform = "rotate(180deg)"
    }
    else {
        console.log("Closing popout menu")
        popoutMenuContent.style.width = "0"
        let buttonWidth = document.getElementById("popout-menu-button").offsetWidth
        let popoutMenu = document.getElementById("popout-menu")
        popoutMenu.style.width = buttonWidth + "px"
        popoutMenu.style.backgroundColor = "transparent"
        popoutMenu.style.borderRight = "0 solid transparent"
        document.getElementById("popout-menu-button").style.transform = "rotate(0deg)"
    }
    let invisibleLi = popoutMenuContent.getElementsByClassName("invisible")
    for (let i = invisibleLi.length - 1; i >= 0; i--)
        invisibleLi.item(i).classList.toggle("invisible")
    popoutMenuContent.classList.toggle("invisible")
}

function activateSlide (slideId) {
    let target = document.getElementById(slideId)
    let isHidden = target.classList.contains("hidden")
    if (isHidden) {
        console.log("Activating slide: " + slideId)
        let slides = document.getElementsByClassName("slide")
        for (let i = slides.length - 1; i >=0; i--) {
            let slide = slides.item(i)
            if (!slide.classList.contains("hidden")) {
                let targetSlideSquare = document.getElementById(slide.id + "-square")
                targetSlideSquare.innerHTML = "&#9634;"
                slide.classList.toggle("hidden")
                break
            }
        }
        let targetSlideSquare = document.getElementById(slideId + "-square")
        targetSlideSquare.innerHTML = "&#9635;"
        target.classList.toggle("hidden")
    }
}

function previousSlide () {
    let slides = document.getElementsByClassName("slide")
    for (let i = slides.length - 1; i >= 0; i--) {
        let slide = slides.item(i)
        if (!slide.classList.contains("hidden")) {
            let slideNumber = parseInt(slide.id.split("-")[1])
            if (slideNumber > 1) {
                activateSlide("slide-" + (slideNumber - 1) )
                break
            }
        }
    }
}

function nextSlide () {
    let slides = document.getElementsByClassName("slide")
    for (let i = slides.length - 1; i >= 0; i--) {
        let slide = slides.item(i)
        if (!slide.classList.contains("hidden")) {
            let slideNumber = parseInt(slide.id.split("-")[1])
            if (slideNumber < slides.length) {
                activateSlide("slide-" + (slideNumber + 1) )
                break
            }
        }
    }
}


function registerDropdownListener () {
    // (mostly for mobile) listens for clicks outside a dropdown so we can close those menu(s) should the user click out of them
    document.addEventListener("click", event => {
        let target = event.target
        let closestDropdownAncestor = target.closest(".dropdown")
        let isDropdownElement = closestDropdownAncestor != null
        if (!isDropdownElement) {
            console.log("Click detected outside of any dropdown menu. Setting display for all dropdown-content to none.")
            let elements = document.getElementsByClassName("dropdown-content")
            // this iterates backwards because accessing elements in-order causes the weirdness with "live" Collections
            for (let i = elements.length - 1; i >= 0; i--) {
                let element = elements.item(i)
                element.style.display = "none"
            }
        }
    })

    let dropdowns = document.getElementsByClassName("dropdown")
    for (let i = dropdowns.length - 1; i >= 0; i--) {
        let dropdown = dropdowns.item(i)
        let dropdownContent = dropdown.querySelector(".dropdown-content")
        let openContentMenu = function () {
            console.log("Opening dropdown content menu")
            dropdownContent.style.display = "flex"
            // matches the width of menu button to the menu (so user is less likely to accidentally mouse-out as soon as they go to select something)
            matchWidth(dropdown.id, dropdownContent.id)
        }
        let closeContentMenu = function () {
            console.log("Closing dropdown content menu")
            dropdownContent.style.display = "none"
            // width returns to normal once the menu is closed (so it doesn't open when user hovers over vacant space)
            dropdown.style.width = "fit-content"
        }
        let toggleMenu = function () {
            if (dropdownContent.style.display === "" || dropdownContent.style.display === "none") {
                openContentMenu()
            }
            else {
                closeContentMenu()
            }
        }
        // register hover listener for desktop users to open menu via mouseover
        dropdown.onmouseover = openContentMenu
        // corresponding mouseout even to close the menu after
        dropdown.onmouseout = closeContentMenu
        // corresponding on-click listener since mobile users can't easily mouse-over without a mouse
        dropdown.onclick = toggleMenu
    }
}