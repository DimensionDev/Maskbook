export interface FileInfo {
    type: 'arweave'
    id: string

    name: string
    size: number
    createdAt: Date

    key: string | null | undefined
    payloadTxID: string
    landingTxID: string
}
