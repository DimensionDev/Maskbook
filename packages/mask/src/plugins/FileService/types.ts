export interface FileInfo {
    type: 'file'
    provider: 'arweave' | 'ipfs' | 'swarm'
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
