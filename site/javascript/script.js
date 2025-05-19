// this will likely need to be updated any time the gateway gets recreated, which is... not ideal
const apiGatewayUrl = "https://gms9t124k8.execute-api.us-east-1.amazonaws.com/primary_api_gateway_stage/KotlinLambda"
const ipifyUrl = "https://api.ipify.org?format=json"

document.addEventListener("DOMContentLoaded", updateVisitDetails)

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
    if (!isNew) {
        document.getElementById("new-ip").classList.add("isHidden")
        document.getElementById("visit-counter").classList.remove("isHidden")
    }
    else {
        document.getElementById("new-ip").classList.remove("isHidden")
        document.getElementById("visit-counter").classList.add("isHidden")
    }
    document.getElementById("previous-visits").textContent = visits
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
            return [json.new_address, json.prior_visits]
        })
}