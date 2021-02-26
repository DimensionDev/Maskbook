export interface VoiceChatMetadata {
    customServer?: string
    version?: number
}

export interface PeerMediaElement {
    /** MediaStream of the connected user */
    stream: MediaStream
    /** Twitter Username of the connected user */
    username: string
    /** If this is you or an external user who joined */
    isLocal: boolean
    /** This is a modified AnalyserNode (AudioContext) */
    meter: VoiceChatExtendedAnalyserNode
}

export interface VoiceChatExtendedAnalyserNode extends AnalyserNode {
    ended: boolean
    stop(): void
}
