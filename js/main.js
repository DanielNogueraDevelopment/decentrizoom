var theirStream;
var mycam = document.getElementById("me");
var theircam = document.getElementById("client-feed");
var keyoutput = document.getElementById("keyoutput");
const parent = document.querySelector('#parent');
const host_feed = document.querySelector('#host-feed');
const chatbox = document.querySelector('#chatbox');
const chat_input = document.querySelector('#chatinput')
var chat = document.getElementById("chat");

var myurl = { urls: "stun:stun.l.google.com:19302" }

var connection = new RTCPeerConnection({ iceServers: [myurl] });
var chatconnection = connection.createDataChannel("chat");

chatconnection.onopen = function () {
    chatadd("Connection established, this is the chat!");
}
chatconnection.onmessage = function (event) {
    console.log("Got a chat message here! ")
    chatadd(event.data);
}

chat_input.addEventListener("keydown", function (event) {
    if (event.keyCode == 13) {
        var message = chat_input.value;
        chatconnection.send(message);
        chatadd(message);
        chat_input.value = "";
    }
});

connection.onaddstream = function (event) {
    theircam.srcObject = event.stream;
    theircam.play();
    theirStream = event.stream;
}

connection.ondatachannel = function (event) {
    chatconnection = event.channel;
}

var UserMedia;

function chatadd(text, isme) {
    if (isme) {

    } else {

    }
    chat.innerHTML = chat.innerHTML + "<br>" + text;
    document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
    setTimeout(function () { chat_input.value = ""; }, 50);
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
    host_feed.style.display = 'inherit';
    if (iswebcam) {
        var UserMedia = navigator.getUserMedia({ video: true, audio: true }, function (stream) {
            myStream = stream;
            mycam.srcObject = stream;
            mycam.muted = true;
            mycam.play();
            connection.addStream(stream);
        }, function (err) {
            console.log(err)
        });
    } else {
        var UserMedia = navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(function (stream) {
            mycam.srcObject = stream;
            mycam.muted = true;
            mycam.play();
            connection.addStream(stream);
        });
    }
    hideMediaSelectors()
}

function hideMediaSelectors() {
    var selectors = document.querySelectorAll(".mediaselector");
    selectors[0].style.display = "none";
    selectors[1].style.display = "none";
    selectors[2].style.display = "none";
    chatbox.style.display = 'block';
}

function toggleChat() {
    if (chat.style.display == "block") {
        chat.style.display = "none";
        chat_input.style.display = "none";
        document.getElementById("chatLabel").style.display = "none";
        document.getElementById("chat-toggler").innerHTML = "+";
    } else {
        chat.style.display = "block";
        chat_input.style.display = "inherit";
        document.getElementById("chatLabel").style.display = "inherit";
        document.getElementById("chat-toggler").innerHTML = "-";
    }
}



//generate the host key.
function genhostkey() {
    connection.createOffer().then(function (hostdesc) {
        connection.setLocalDescription(hostdesc)
    })
    connection.onicecandidate = function (event) {
        var hostkey = LZString.compressToUTF16(connection.localDescription.sdp);
        keyoutput.value = hostkey;

        copy();

    }
    document.getElementById("hostgenerator").style.display = "none";
    document.getElementById("friendloader").style.display = "inline-block";
    document.querySelector('#loadhostkey').style.display = "none";
}

function connecttohost(key) {

    var hostdesc = new RTCSessionDescription({ type: "offer", sdp: LZString.decompressFromUTF16(key) });

    connection.setRemoteDescription(hostdesc).then(function () {
        connection.createAnswer();
    }).then(function (mygivendesc) {
        connection.setLocalDescription(mygivendesc);
    })

    connection.onicecandidate = function (event) {
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
    hidekeytools();
    hideModal();
}

function copy() {
    keyoutput.select();
    keyoutput.setSelectionRange(0, 99999);
    document.execCommand("copy");
    keyoutput.value = "";
}

var recorder;
var recording = false;
var record = [];
function toggleRecording() {
    var options = { mimeType: 'video/webm;codecs=vp9' };
    if (recording) {
        recorder.stop();
    } else {
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.error(`${options.mimeType} is not Supported`);
            errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
            options = { mimeType: 'video/webm;codecs=vp8' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.error(`${options.mimeType} is not Supported`);
                errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
                options = { mimeType: 'video/webm' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.error(`${options.mimeType} is not Supported`);
                    errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
                    options = { mimeType: '' };
                }
            }
        }
        recorder = new MediaRecorder(theirStream, options);
        recorder.ondataavailable = function (event) {
            if (event.data && event.data.size > 0) {
                record.push(event.data);
            }
        }
        recorder.start(1000);
    }
}



function downloadData() {
    const url = window.URL.createObjectURL(new Blob(record, { type: "video/webm" }));
    const downloader = document.createElement("a");
    downloader.style.display = "none";
    downloader.href = url;
    downloader.download = "RecordedDecentrizoomSession.webm"
    downloader.click();
    window.URL.revokeObjectURL(url);
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
        // host_feed.ad.log(current_x, current_y);
    } else {
        console.log('out bounds');
        mycam.style.transform = `translate3d(${lastValidX}px, ${lastValidY}px, 0)`;

        current_x = lastValidX;
        current_y = lastValidY;
        init_x = current_x;
        init_y = current_y;
        xOffset = current_x;
        yOffset = current_y;
    }
    active = false;
}




host_feed.addEventListener('mousedown', dragElementStart, false);
document.addEventListener('mouseup', dragElementEnd, false);
document.addEventListener('mousemove', dragging, false);
