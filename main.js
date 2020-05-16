var myurl = { urls: "stun:stun.l.google.com:19302" }

var connection = new RTCPeerConnection({ iceServers: [myurl] })
var mycam = document.getElementById("me");
var theircam = document.getElementById("friend");

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
        console.log(hostkey);



    }
}

function connecttohost(key) {
    var hostdesc = new RTCSessionDescription({ type: "offer", sdp: LZString.decompress(key) });
    connection.setRemoteDescription(hostdesc).then(function() {
        connection.createAnswer()
    }).then(function(mygivendesc) {
        connection.setLocalDescription(mygivendesc)
    })

    connection.onicecandidate = function(event) {
        return LZString(connection.localDescription.sdp)
    }
}

function