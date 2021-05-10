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

async function startBasicCall() {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    await client.join(options.appId, options.channel, options.token, null);
    options.uid = client._uid;
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    const localPlayerContainer = document.createElement("div");
    localPlayerContainer.textContent = "Me " + options.uid.toString();
    localPlayerContainer.id = options.uid;
    localPlayerContainer.style.width = "320px";
    localPlayerContainer.style.height = "240px";
    document.getElementById('video-grid').appendChild(localPlayerContainer);

    await client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
    rtc.localVideoTrack.play(localPlayerContainer);
    console.log("publish success!");

    for(const user of client.remoteUsers) {
        subscribeToNewUser(client, user)
    }

    client.on("user-published", async (user, mediaType) => {
        subscribeToNewUser(client, user);

        client.on("user-unpublished", async (user) => {
            const mediaType = user.hasVideo ? "video" : "audio";
            await client.unsubscribe(user, mediaType);
            const remotePlayerContainer = document.getElementById(user.uid);
            remotePlayerContainer.remove();
        });

    });
}

async function subscribeToNewUser(client, user){
    const mediaType = user.hasVideo ? "video" : "audio";

    await client.subscribe(user, mediaType);
    console.log("subscribe success");

    const remoteVideoTrack = user.videoTrack;
    const remoteAudioTrack = user.audioTrack;
    const remotePlayerContainer = document.createElement("div");
    remotePlayerContainer.textContent = "Remote user " + user.uid.toString();
    remotePlayerContainer.id = user.uid;
    remotePlayerContainer.style.width = "320px";
    remotePlayerContainer.style.height = "240px";
    document.getElementById('video-grid').appendChild(remotePlayerContainer);
    
    if (mediaType === "video") remoteVideoTrack.play(remotePlayerContainer);
    if (mediaType === "audio") remoteAudioTrack.play();
}

startBasicCall()