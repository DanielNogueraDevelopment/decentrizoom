var myurl = { urls: "stun:stun.l.google.com:19302" }

var connection = new RTCPeerConnection({ iceServers: [myurl] });
var chatconnection = new RTCPeerConnection({ iceServers: [myurl] })
var mycam = document.getElementById("me");
var theircam = document.getElementById("client-feed");
var keyoutput = document.getElementById("keyoutput");
const host_feed = document.querySelector('#host-feed');
connection.onaddstream = function(event) {
    theircam.srcObject = event.stream;
    theircam.play();
}
var UserMedia;


function loadMedia(iswebcam) {
    if (iswebcam) {
        var UserMedia = navigator.getUserMedia({ video: true, audio: true }, function(stream) {
            mycam.srcObject = stream;
            mycam.muted = true;
            mycam.play();
            connection.addStream(stream);
        }, function(err) {
            console.log(err)
        });
    } else {
        var UserMedia = navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(function(stream) {
            mycam.srcObject = stream;
            mycam.muted = true;
            mycam.play();
            connection.addStream(stream);
        });
    }
    document.querySelector(".mediaselector").style.display = "none";
}





//generate the host key.
function genhostkey() {
    connection.createOffer().then(function(hostdesc) {
        connection.setLocalDescription(hostdesc)
    })
    connection.onicecandidate = function(event) {
        var hostkey = LZString.compressToUTF16(connection.localDescription.sdp);
        keyoutput.value = hostkey;

        copy();

    }
    document.getElementById("hostgenerator").style.display = "none";
    document.getElementById("friendloader").style.display = "inherit";



}

function connecttohost(key) {
    var hostdesc = new RTCSessionDescription({ type: "offer", sdp: LZString.decompressFromUTF16(key) });

    connection.setRemoteDescription(hostdesc).then(function() {
        connection.createAnswer();
    }).then(function(mygivendesc) {
        connection.setLocalDescription(mygivendesc);
    })

    connection.onicecandidate = function(event) {
        keyoutput.value = LZString.compressToUTF16(connection.localDescription.sdp);
        document.getElementById("keyoutput").style.display = "inherit";
        copy();
    }
}

function adduser(friendkey) {
    console.log(LZString.decompressFromUTF16(friendkey));
    if (connection.signalingState == "have-local-offer") {
        connection.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: LZString.decompressFromUTF16(friendkey) }))
    }
}

function copy() {
    keyoutput.select();
    keyoutput.setSelectionRange(0, 99999);
    document.execCommand("copy");
}

let xOffset = 0,
    yOffset = 0,
    init_x,
    init_y,
    current_x,
    current_y;

const dragElementStart = e => {
    e.preventDefault();
    console.log(e.clientX, e.clientY);
    current_x = e.clientX - xOffset;
    current_y = e.clientY - yOffset;
}

const dragging = e => {
    e.preventDefault();
    // if (e.target === mycam) {
    current_x = e.clientX - init_x;
    current_y = e.clientY - init_y;

    xOffset = current_x;
    yOffset = current_y;
    mycam.style.transform = `translate3d(${current_x}px, ${current_y}px, 0)`;
    // }
}

const dragElementEnd = _ => {
    init_x = current_x;
    init_y = current_y;
}

host_feed.addEventListener('mousedown', dragElementStart);
host_feed.addEventListener('mouseup', dragElementEnd);
host_feed.addEventListener('mousemove', dragging);