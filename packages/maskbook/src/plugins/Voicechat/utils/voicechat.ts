import io from 'socket.io-client'
import { SIGNALING_SERVER, ICE_SERVERS } from '../constants'
import type { PeerMediaElement } from '../types'
import { VolumeMeter } from './volumeMeter'

let signalingSocket: SocketIOClient.Socket | null = null
let localMediaStream: MediaStream | null = null
let peers: Record<string, RTCPeerConnection> = {}
let peerMediaElements: Record<string, PeerMediaElement> = {}
let localPeerMediaElement: PeerMediaElement | null = null
let speakingUsers: string[] = []
let activeMediaDevice: string = ''

let audioContext: AudioContext | null = null

type StateCallback = (a: Record<string, PeerMediaElement>, b: PeerMediaElement | null) => void
let stateCallback: StateCallback = (a, b) => {}
let speakingCallback = (a: string[]) => {}
let activeMediaDeviceCallback = (a: string) => {}

export function init(
    customServer: string,
    id: string,
    username: string,
    callback: StateCallback,
    activeMediaCallback: (a: string) => void,
) {
    // Do a disconnect
    disconnectVoice()

    // Register callbacks
    stateCallback = callback
    activeMediaDeviceCallback = activeMediaCallback

    if (!audioContext) {
        audioContext = new AudioContext()
    }

    console.log('connecting to signaling server')
    signalingSocket = io(customServer ? customServer : SIGNALING_SERVER, { transports: ['websocket'] })

    signalingSocket.on('connect', function () {
        console.log('connected to signaling server')

        setup_local_media(
            () => {
                join_chat_channel(id, { username })
            },
            () => {},
            username,
        )
    })

    setTimeout(() => {
        if (!signalingSocket?.connected) {
            alert('Could not connect to voice server')
            disconnectVoice()
        }
    }, 3000)

    signalingSocket.on('disconnect', function () {
        console.log('Disconnected from signaling server')

        disconnectVoice()
    })

    function join_chat_channel(channel: string, userdata: Object) {
        signalingSocket?.emit('join', { channel, userdata })
    }
    function part_chat_channel(channel: string) {
        signalingSocket?.emit('part', channel)
    }

    signalingSocket.on('addPeer', (config: Config) => {
        console.log('Signaling server said to add peer: ', config)

        const peerID = config.peer_id

        if (peerID in peers) {
            console.log('Already connected to peer ', peerID)
            return
        }

        const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS })
        peers[peerID] = peerConnection

        peerConnection.onicecandidate = function (event: RTCPeerConnectionIceEvent) {
            if (event.candidate) {
                signalingSocket?.emit('relayICECandidate', {
                    peer_id: peerID,
                    ice_candidate: {
                        sdpMLineIndex: event.candidate.sdpMLineIndex,
                        candidate: event.candidate.candidate,
                    },
                })
            }
        }

        peerConnection.ontrack = function (event: RTCTrackEvent) {
            console.log('onAddTrack', event)

            const meter = createFeat(event.streams[0], config.userdata.username, false)!
            peerMediaElements[peerID] = {
                stream: event.streams[0],
                username: config.userdata.username,
                isLocal: false,
                meter,
            }

            updateState()
        }

        localMediaStream?.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localMediaStream as MediaStream)
        })

        if (config.should_create_offer) {
            console.log('Creating RTC offer to', peerID)

            peerConnection
                .createOffer()
                .then((localDescription) => {
                    console.log('Local offer description is: ', localDescription)

                    peerConnection
                        .setLocalDescription(localDescription)
                        .then(() => {
                            signalingSocket?.emit('relaySessionDescription', {
                                peer_id: peerID,
                                session_description: localDescription,
                            })
                            console.log('Offer setLocalDescription succeeded')
                        })
                        .catch(() => {
                            alert('Offer setLocalDescription failed!')
                        })
                })
                .catch((error) => {
                    console.log('Error sending offer: ', error)
                })
        }
    })

    signalingSocket.on('sessionDescription', (config: Config) => {
        console.log('Remote description received: ', config)

        const peerID = config.peer_id
        const peer = peers[peerID]
        const remoteDescription = config.session_description

        console.log(config.session_description)

        const desc = new RTCSessionDescription(remoteDescription)
        peer.setRemoteDescription(desc)
            .then(() => {
                console.log('setRemoteDescription succeeded')
                if (remoteDescription.type == 'offer') {
                    console.log('Creating answer')

                    peer.createAnswer()
                        .then((localDescription) => {
                            console.log('Answer description is: ', localDescription)
                            peer.setLocalDescription(localDescription)
                                .then(() => {
                                    signalingSocket?.emit('relaySessionDescription', {
                                        peer_id: peerID,
                                        session_description: localDescription,
                                    })
                                    console.log('Answer setLocalDescription succeeded')
                                })
                                .catch(() => {
                                    alert('Answer setLocalDescription failed!')
                                })
                        })
                        .catch((error) => {
                            console.log('Error creating answer: ', error)
                            console.log(peer)
                        })
                }
            })
            .catch((error) => {
                console.log('setRemoteDescription error: ', error)
            })

        console.log('Description Object: ', desc)
    })

    signalingSocket.on('iceCandidate', function (config: Config) {
        const peer = peers[config.peer_id]
        const ice_candidate = config.ice_candidate
        peer.addIceCandidate(new RTCIceCandidate(ice_candidate))
    })

    signalingSocket.on('removePeer', function (config: Config) {
        console.log('Signaling server said to remove peer:', config)

        const peerID = config.peer_id

        if (peerID in peerMediaElements) {
            peerMediaElements[peerID].meter.stop()
            peerMediaElements[peerID].stream.getTracks().forEach((t) => t.stop())
            delete peerMediaElements[peerID]
        }

        if (peerID in peers) {
            peers[peerID].close()
            delete peers[peerID]
        }

        updateState()
    })
}

interface Config {
    ice_candidate: any
    session_description: any
    should_create_offer: any
    userdata: any
    peer_id: any
}

// Local Media
function setup_local_media(callback: () => void, errorback: () => void, username: string) {
    if (localMediaStream != null) {
        if (callback) callback()
        return
    }

    console.log('Requesting access to local audio inputs')

    const audioGet = activeMediaDevice ? { deviceId: activeMediaDevice } : true

    navigator.getUserMedia(
        { audio: audioGet },
        (stream) => {
            console.log('Access granted to audio')

            localMediaStream = stream

            activeMediaDevice = stream.getTracks()[0].getSettings().deviceId ?? ''
            updateActiveMediaDevice()

            const meter = createFeat(stream, username, true)!
            localPeerMediaElement = {
                stream,
                meter,
                isLocal: true,
                username,
            }
            updateState()

            if (callback) callback()
        },
        () => {
            console.log('Access denied for audio/video')

            if (errorback) errorback()
        },
    )
}

export function changeMediaDevice(deviceId: string, username: string) {
    localPeerMediaElement?.meter.stop()
    localPeerMediaElement?.stream.getTracks().forEach((t) => t.stop())

    navigator.getUserMedia(
        { audio: { deviceId } },
        (stream) => {
            localMediaStream = stream

            activeMediaDevice = stream.getTracks()[0].getSettings().deviceId ?? ''
            updateActiveMediaDevice()

            const meter = createFeat(stream, username, true)!
            localPeerMediaElement = {
                stream,
                meter,
                isLocal: true,
                username,
            }
            updateState()

            const track = localMediaStream.getTracks()[0]

            for (const peerID in peers) {
                const pc = peers[peerID]

                const sender = pc.getSenders().find((s: RTCRtpSender) => s.track?.kind === track.kind)
                if (sender) {
                    sender.replaceTrack(track)
                }
            }
        },
        () => {},
    )
}

export function disconnectVoice() {
    for (const peerID in peerMediaElements) {
        peerMediaElements[peerID].meter.stop()
        peerMediaElements[peerID].stream.getTracks().forEach((t) => t.stop())
    }

    for (const peerID in peers) {
        peers[peerID].close()
    }

    peers = {}
    peerMediaElements = {}

    localPeerMediaElement?.meter.stop()
    localPeerMediaElement?.stream.getTracks().forEach((t) => t.stop())

    localPeerMediaElement = null
    localMediaStream = null

    try {
        signalingSocket?.close()
    } catch (e) {}

    updateState()
}

export function registerSpeakingUsernames(fun: (a: string[]) => void) {
    speakingCallback = fun
}

export function setMuted(bool: boolean) {
    localPeerMediaElement?.stream.getTracks().forEach((track) => {
        track.enabled = !bool
    })
}

function createFeat(stream: MediaStream, username: string, isLocal: boolean) {
    if (!audioContext) {
        return
    }

    if (!isLocal) {
        const audio = new Audio()
        audio.srcObject = stream
        audio.play()
    }

    //- Meter
    const src = audioContext.createMediaStreamSource(stream)
    const meter = VolumeMeter(audioContext, {}, (volume: number) => {
        if (volume >= 0.3 && !speakingUsers.includes(username)) {
            speakingUsers.push(username)
            updateSpeakingUsers()
        } else if (volume < 0.3 && speakingUsers.includes(username)) {
            speakingUsers = speakingUsers.filter((u) => u !== username)
            updateSpeakingUsers()
        }
    })
    src.connect(meter)
    //- Meter END

    return meter
}

function updateState() {
    stateCallback(peerMediaElements, localPeerMediaElement)
}

function updateSpeakingUsers() {
    speakingCallback([...speakingUsers])
}

function updateActiveMediaDevice() {
    activeMediaDeviceCallback(activeMediaDevice)
}
