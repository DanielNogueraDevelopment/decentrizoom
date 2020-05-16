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
    UserMedia.then(function() {
        connection.createOffer()

    }).then(function(hostdescription) {
        connection.setLocalDescription(hostdescription)
    })

    connection.onicecandidate = function(event) {

        console.log(connection.localDescription.sdp)




    }


}