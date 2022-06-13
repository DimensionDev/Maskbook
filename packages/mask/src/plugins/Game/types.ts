export interface GameDialogEvent {
    open: boolean
    tokenProps?: GameNFT
}

export interface GameRSSNode {
    address: string
    signature: string
    games: Record<string, any>
}

export interface GameInfo {
    id: number
    name: string
    image: string
    description: string
    url: string
    rank: number
    width: number
    height: number
}

export interface GameNFT {
    tokenId?: string
    contract?: string
    chainId?: number
}
