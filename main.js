var myurl = { urls: "stun:stun.l.google.com:19302" }

var connection = new RTCPeerConnection({ iceServers: [myurl] })
var mycam = document.getElementById("me");
var theircam = document.getElementById("friend");
var keyoutput = document.getElementById("keyoutput");
connection.onaddstream = function(event) {
    theircam.srcObject = event.stream;
    theircam.play();
}

var UserMedia = navigator.getUserMedia({ video: true, audio: true }, function(stream) {
    mycam.srcObject = stream;
    mycam.muted = true;
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


        var hostkey = LZString.compressToUTF16(connection.localDescription.sdp);
        keyoutput.value = hostkey;
        document.getElementById("copier").style.display = "inherit";
        copy()



    }
    document.getElementById("hostgenerator").innerHTML = "Load Friend Key";
    document.getElementById("hostgenerator").removeEventListener("click", genhostkey)


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
        document.getElementById("copier").style.display = "inherit";
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

    var copyText = document.getElementById("keyoutput");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");



}