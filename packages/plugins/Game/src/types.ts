import type { Constant } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export interface GameDialogEvent {
    open: boolean
    tokenProps?: GameNFT
}

export interface GameRSSNode {
    address: string
    signature: string
    games: Record<string, Constant>
}

export interface GameInfo {
    id: number
    name: string
    image: string
    description: string
    snsId: string
    url: string
    wallet: boolean
    rank: number
    width: number
    height: number
}

export interface GameNFT {
    tokenId?: string
    contract?: string
    chainId?: ChainId
}
