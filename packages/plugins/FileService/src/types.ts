export enum Provider {
    arweave = 'arweave',
    ipfs = 'ipfs',
    swarm = 'swarm',
}

export interface ProviderConfig {
    provider: Provider
    name: string
}

export interface LandingPageMetadata {
    key: string | null | undefined
    name: string
    size: number
    type: string
    txId: string
    useCDN: boolean
}

export interface AttachmentOptions {
    key?: string | null
    type: string
    block: Uint8Array
    name: string
}

export interface ProviderAgent {
    makeAttachment(options: AttachmentOptions): Promise<string>
    upload(id: string): AsyncGenerator<number>
    uploadLandingPage(metadata: LandingPageMetadata): Promise<string>
}

export interface FileInfo {
    type: 'file'
    provider: Provider
    id: string

    name: string
    size: number
    createdAt: Date

    key: string | undefined
    payloadTxID: string
    landingTxID: string
}

export type FileInfoV1 = Omit<FileInfo, 'type' | 'provider'> & {
    type: 'arweave'
}

export interface JWKPublicInterface {
    kty: string
    e: string
    n: string
}

export interface JWKInterface extends JWKPublicInterface {
    d?: string
    p?: string
    q?: string
    dp?: string
    dq?: string
    qi?: string
}
