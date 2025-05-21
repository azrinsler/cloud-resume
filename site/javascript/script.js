// this will likely need to be updated any time the gateway gets recreated, which is... not ideal
// const apiGatewayUrl = "https://gms9t124k8.execute-api.us-east-1.amazonaws.com/primary_api_gateway_stage/KotlinLambda"
const apiGatewayUrl = "https://api.azrinsler.com/KotlinLambda"
const ipifyUrl = "https://api.ipify.org?format=json"

document.addEventListener("DOMContentLoaded", updateVisitDetails)
document.addEventListener("DOMContentLoaded", function () {
    matchWidth("architecture-diagram", "text-column")
})

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

let isDarkMode = true;
function toggleMode () {
    let elements = document.getElementsByClassName(isDarkMode ? "dark" : "light")

    isDarkMode = !isDarkMode

    if (isDarkMode) console.log("Toggling dark elements to light")
    else            console.log("Toggling light elements to dark")

    console.log("Elements to be toggled:")
    console.log(elements)

    // this iterates backwards because accessing elements in-order causes the weirdness with "live" Collections
    for (let i = elements.length - 1; i >= 0; i--) {
        let element = elements.item(i)
        console.log("Toggling element:")
        console.log(elements.item(i))
        element.classList.toggle("light")
        element.classList.toggle("dark")
    }
}

function matchWidth (thisElement, thatElement) {
    console.log("Attempting to match width of '#" + thisElement + "' to that of '#" + thatElement + "'")
    let source = document.getElementById(thisElement)
    let target = document.getElementById(thatElement).offsetWidth //.getBoundingClientRect()
    let targetWidth = target.toString() + "px"
    console.log("Source width: " + source.getBoundingClientRect().width.toString())
    console.log("Target width: " + targetWidth)
    //source.setAttribute("style", "width:" + targetWidth + ";")
    source.style.width = targetWidth
}