var remoteUsers = {};

var rtc = {
    localAudioTrack: null,
    localVideoTrack: null,
};

var options = {
    appId: "ca8a9f02e5654d25bbaf716ce2beb024",
    channel: "deneme",
    token: "006ca8a9f02e5654d25bbaf716ce2beb024IAA7uUz5XxZLe4ZZigkjlTGKbfxryNvwBkft4vQzQp/VpBQdGwsAAAAAEADn5pQIC6aaYAEAAQALpppg",
    uid: null
};

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

async function startBasicCall() {
    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);

    options.uid = await client.join(options.appId, options.channel, options.token, null);
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    const localPlayerContainer = document.createElement("div");
    localPlayerContainer.textContent = "ME-" + options.uid.toString();
    localPlayerContainer.id = options.uid;
    localPlayerContainer.className = "video-container";
    localPlayerContainer.style.width = "320px";
    localPlayerContainer.style.height = "240px";
    document.getElementById('video-grid').appendChild(localPlayerContainer);
    rtc.localVideoTrack.play(localPlayerContainer);

    await client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
    console.log("publish success!");
}

async function leave() {
    for (trackName in rtc) {
        var track = rtc[trackName];
        if(track) {
            track.stop();
            track.close();
            rtc[trackName] = undefined;
        }
    }
    // Remove remote users and player views.
    remoteUsers = {};

    // leave the channel
    await client.leave();
    console.log("client leaves channel success");
}

async function subscribe(user, mediaType) {
    const uid = user.uid;
    // subscribe to a remote user
    await client.subscribe(user, mediaType);
    console.log("subscribe success");

    if (mediaType === 'video') {
        const remoteVideoTrack = user.videoTrack;
        const remotePlayerContainer = document.createElement("div");
        remotePlayerContainer.textContent = "USER-" + uid.toString();
        remotePlayerContainer.id = uid;
        remotePlayerContainer.className = "video-container";
        remotePlayerContainer.style.width = "320px";
        remotePlayerContainer.style.height = "240px";
        document.getElementById('video-grid').appendChild(remotePlayerContainer);
        remoteVideoTrack.play(remotePlayerContainer);
    }
    if (mediaType === 'audio') {
      user.audioTrack.play();
    }
}

function handleUserPublished(user, mediaType) {
    const id = user.uid;
    remoteUsers[id] = user;
    subscribe(user, mediaType);
}

function handleUserUnpublished(user) {
    const id = user.uid;
    delete remoteUsers[id];
    document.getElementById(id).remove();
}

startBasicCall();