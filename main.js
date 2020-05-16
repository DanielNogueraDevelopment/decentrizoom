var myurl = { urls: "stun:stun.l.google.com:19302" }

var connection = new RTCPeerConnection({ iceServers: [myurl] })
var mycam = document.getElementById("me");
var theircam = document.getElementById("friend");
var keyinput = document.getElementById("keyinput");
var keyoutput = document.getElementById("keyoutput");
connection.onaddstream = function(event) {
    theircam.srcObject = event.stream;
}

var UserMedia = navigator.getUserMedia({ video: true, audio: false }, function(stream) {
    mycam.srcObject = stream;
    mycam.play();
    connection.addStream(stream);
}, function(err) {
    console.log(err)
});


//generate the host key.
function genhostkey() {
    connection.createOffer().then(function(hostdescription) {
        connection.setLocalDescription(hostdescription);
    })
    connection.onicecandidate = function(event) {


        var hostkey = LZString.compress(connection.localDescription.sdp);
        keyoutput.innerHTML = hostkey



    }
}

function connecttohost(key) {
    var hostdesc = new RTCSessionDescription({ type: "offer", sdp: LZString.decompress(key) });
    console.log(hostdesc)
    connection.setRemoteDescription(hostdesc).then(function() {
        connection.createAnswer();
    }).then(function(mygivendesc) {
        connection.setLocalDescription(mygivendesc);
    })

    connection.onicecandidate = function(event) {
        return LZString.compress(connection.localDescription.sdp);
    }
}

function adduser(friendkey) {
    if (connection.signalingState == "have-local-offer") {
        connection.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: LZString.decompress(friendkey) }))
    }
}