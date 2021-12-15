export enum Provider {
    arweave = 'arweave',
    ipfs = 'ipfs',
    swarm = 'swarm'
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
