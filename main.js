var myurl = { urls: "stun:stun.l.google.com:19302" }

var initiator = new RTCPeerConnection({ iceServers: [myurl] })



initiator.onaddstream = function(event) {
    v2.srcObject = event.stream;
}

var