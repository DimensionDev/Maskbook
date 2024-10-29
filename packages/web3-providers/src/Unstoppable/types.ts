type Meta = {
    domain: string
    tokenId: string
    namehash: string
    blockchain: string
    /** chain id */
    networkId: number
    owner: string
    resolver: string
    registry: string
    reverse: boolean
    type: 'Uns' | 'Zilliqa' | 'Ens'
    customMeta: {
        expiresAt: number
        /** hex */
        fuses: string
    }
}

type Records = {
    contenthash: string
    addr: string
    [key: string]: string
}

export interface ResolveDomainResponse {
    meta: Meta
    records: Records[]
    recordsSource: Record<string, unknown>
}
