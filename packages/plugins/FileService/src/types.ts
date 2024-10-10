import type { FileFrameProps } from '@masknet/shared'

export enum Provider {
    Arweave = 'arweave',
    IPFS = 'ipfs',
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
    /**
     * Before v3, it's checksum of the file.
     * Since v3, it's digest(file, [provider, useCDN, encrypted])
     */
    id: string

    name: string
    size: number
    /**
     * Before v3, it's Date
     * Since v3, it's number
     */
    createdAt: number | string

    key: string | undefined
    /** Doesn't exist in uploading file info */
    payloadTxID?: string
    /** Doesn't exist in uploading file info */
    landingTxID?: string
}

export type FileBaseProps = Omit<FileFrameProps, 'fileName'>

export type FileInfoV1 = Omit<FileInfo, 'type' | 'provider'> & {
    type: 'arweave'
}
