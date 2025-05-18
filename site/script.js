// this will likely need to be updated any time the gateway gets recreated, which is... not ideal
const apiGatewayUrl = "https://gms9t124k8.execute-api.us-east-1.amazonaws.com/primary_api_gateway_stage"
const ipifyUrl = "https://api.ipify.org?format=json"

document.addEventListener("DOMContentLoaded", setDisplayedIP)

async function setDisplayedIP () {
    document.getElementById("display-ip").textContent = await getIP()
}

async function getIP () {
    // fetch creates a promise returning from the input url
    return await fetch(ipifyUrl)
        // with subsequent .then calls used to transform the returned response
        .then(response => response.json() )
        .then(json => json.ip)
        .catch(e => console.error("Failed to fetch IP:", e))
}

async function putToDynamoDB (value) {

}