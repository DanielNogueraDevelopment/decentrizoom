var myurl = { urls: "stun:stun.l.google.com:19302" }

var connection = new RTCPeerConnection({ iceServers: [myurl] });
var chatconnection = connection.createDataChannel("chat");

chatconnection.onopen = function() {
    chatadd("Connection established, this is the chat!");
}
chatconnection.onmessage = function(event) {
    console.log("Got a chat message here! ")
    chatadd(event.data);
}



document.getElementById("chatinput").addEventListener("keydown", function(event) {
    if (event.keyCode == 13) {
        var message = document.getElementById("chatinput").value;
        chatconnection.send(message);
        chatadd(message);
        document.getElementById("chatinput").value = "";
    }
})

var mycam = document.getElementById("me");
var theircam = document.getElementById("client-feed");
var keyoutput = document.getElementById("keyoutput");
const host_feed = document.querySelector('#host-feed');
var chat = document.getElementById("chat");
connection.onaddstream = function(event) {
    theircam.srcObject = event.stream;
    theircam.play();
}

connection.ondatachannel = function(event) {
    chatconnection = event.channel;
}




var UserMedia;

function chatadd(text, isme) {
    if (isme) {

    } else {

    }
    chat.innerHTML = chat.innerHTML + "<br>" + text;
    document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
    setTimeout(function() { document.getElementById("chatinput").value = ""; }, 50);
}

function hidekeytools() {
    var tools = document.querySelectorAll(".keytool");
    console.log(tools);

    tools[0].style.display = "none";
    tools[1].style.display = "none";
    tools[2].style.display = "none";
    tools[3].style.display = "none";
}



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
    var selectors = document.querySelectorAll(".mediaselector")
    selectors[0].style.display = "none";
    selectors[1].style.display = "none";
    selectors[2].style.display = "none";
}

function hideMediaSelectors() {
    var selectors = document.querySelectorAll(".mediaselector")
    selectors[0].style.display = "none";
    selectors[1].style.display = "none";
    selectors[2].style.display = "none";
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
        setTimeout(hidekeytools, 1000);
    }
}

function adduser(friendkey) {

    console.log(LZString.decompressFromUTF16(friendkey));
    if (connection.signalingState == "have-local-offer") {
        connection.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: LZString.decompressFromUTF16(friendkey) }))
    }
    hidekeytools()
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
    current_y,
    lastValidX,
    lastValidY,
    active = false;

const dragElementStart = e => {
    e.preventDefault();

    init_x = e.clientX - xOffset;
    init_y = e.clientY - yOffset;
    // console.log(current_x, current_y);
    if (e.target === mycam) active = true;
}

const dragging = e => {
    if (active) {
        console.log('dragging');
        e.preventDefault();

        if (e.target === mycam) {
            current_x = e.clientX - init_x;
            current_y = e.clientY - init_y;
            xOffset = current_x;
            yOffset = current_y;
            mycam.style.transform = `translate3d(${current_x}px, ${current_y}px, 0)`;
        }
    }
}

const dragElementEnd = e => {
    const element_style = getComputedStyle(e.target);
    const width = parseInt(element_style.width.match(/\d+/g)[0]);
    const height = parseInt(element_style.height.match(/\d+/g)[0]);

    const LEFT_BOUNDS = innerWidth - width;
    const BOTTOM_BOUNDS = innerHeight - height;

    const element_rect = e.target.getBoundingClientRect();
    const x = element_rect.x;
    const y = element_rect.y;

    if (x <= LEFT_BOUNDS && x >= 0 && y <= BOTTOM_BOUNDS && y >= 0) {
        console.log('in bounds');
        mycam.style.transform = `translate3d(${current_x}px, ${current_y}px, 0)`;
        lastValidX = current_x;
        lastValidY = current_y;
        
    init_x = current_x;
    init_y = current_y;
        console.log(current_x, current_y);
    } else {
        console.log('out bounds');
        mycam.style.transform = `translate3d(${lastValidX}px, ${lastValidY}px, 0)`;
         
        current_x = lastValidX;
        current_x = lastValidY;
        init_x = current_x;
        init_y = current_y;
        xOffset = current_x;
        yOffset = current_y;
    }
    active = false;
}
    host_feed.addEventListener('mousedown', dragElementStart, false);
    host_feed.addEventListener('mouseup', dragElementEnd, false);
    document.addEventListener('mousemove', dragging, false);
