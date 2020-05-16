var myurl = { urls: "stun:stun.l.google.com:19302" }

var initiator = new RTCPeerConnection({ iceServers: [myurl] })
var mycam = document.getElementById("me");
var theircam = document.getElementById("friend");


initiator.onaddstream = function(event) {
    theircam.srcObject = event.stream;
}

var UserMedia = navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function(stream) {
    initiator.addStream(mycam.srcObject = stream)
})


//generate the host key.
function genhostkey() {
    UserMedia.then(function() {


    })
}