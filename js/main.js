const parent = document.querySelector('#parent');
const host_feed = document.querySelector('#host-feed');
const chatbox = document.querySelector('#chatbox');
const chat_input = document.querySelector('#chatinput');

var theirStream;
var mycam = document.getElementById("me");
var theircam = document.getElementById("client-feed");
var keyoutput = document.getElementById("keyoutput");
var chat = document.getElementById("chat-window");


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

chat_input.addEventListener("keydown", function(event) {
    if (event.keyCode == 13) {
        var message = chat_input.value;
        chatconnection.send(message);
        chatadd(message);
        chat_input.value = "";
    }
});

connection.onaddstream = function(event) {
    theircam.srcObject = event.stream;
    theircam.play();
    theirStream = event.stream;
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
    chat.scrollTop = chat.scrollHeight;
    setTimeout(function() { chat_input.value = ""; }, 50);
}

function hidekeytools() {
    const tools = document.querySelectorAll(".keytool");
    [...tools].map(tool => tool.style.display = "none");
}

function loadMedia(iswebcam) {
    host_feed.style.display = 'inherit';
    if (iswebcam) {
        var UserMedia = navigator.getUserMedia({ video: true, audio: true }, function(stream) {
            myStream = stream;
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
    hideMediaSelectors();
}

function hideMediaSelectors() {
    const selectors = document.querySelectorAll(".mediaselector");
    [...selectors].map(selector => selector.style.display = "none");
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
    connection.createOffer().then(function(hostdesc) {
        connection.setLocalDescription(hostdesc)
    })
    connection.onicecandidate = function(event) {
        var hostkey = LZString.compressToUTF16(connection.localDescription.sdp);
        keyoutput.value = hostkey;

        copy();

    }
    document.getElementById("hostgenerator").style.display = "none";
    document.getElementById("friendloader").style.display = "inline-block";
    document.querySelector('#loadhostkey').style.display = "none";

    displayNotification('Host key copied to clipboard! Share this key and wait for a key from your friend.', 'ok');
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
        hideModal();
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
var recordtype;

function toggleRecording() {
    var options = { mimeType: 'video/webm;codecs=vp9' };
    if (recording) {
        recorder.stop();
        document.getElementById("record").innerHTML = "Record";
        downloadData();
        recording = false;

    } else {
        document.getElementById("record").innerHTML = "Recording..."
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
        recordtype = options.mimeType;
        recorder = new MediaRecorder(theirStream, options);
        recorder.ondataavailable = function(event) {
            if (event.data && event.data.size > 0) {
                record.push(event.data);
            }
        }
        recorder.start(10);
        recording = true;
    }
}



function downloadData() {
    const url = window.URL.createObjectURL(new Blob(record, { type: recordtype }));
    const downloader = document.createElement("a");
    downloader.style.display = "none";
    downloader.href = url;
    downloader.download = "RecordedDecentrizoomSession.webm"
    downloader.click();
    window.URL.revokeObjectURL(url);
}