export interface FileInfo {
    type: 'arweave'
    id: string

    name: string
    size: number
    createdAt: Date

    key: string | undefined
    payloadTxID: string
    landingTxID: string
}
