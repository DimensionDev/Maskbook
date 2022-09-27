import type { GeneratedIconProps } from '@masknet/icons'

export enum AssetType {
    FungibleToken = 'FungibleToken',
    NonFungibleToken = 'NonFungibleToken',
}

export interface Task {
    recipient?: string
    recipientSnsId?: string
    recipients: Recipient[]
}

export interface Recipient {
    address: string
    name?: string
    verified?: boolean
    last_checked_at?: string
}

export type NonFungibleToken = [address: string, tokenId: string]

export type Settings = {
    hiddenAddresses?: string[]
    defaultAddress?: string
}

export interface Network {
    name: string
    icon: React.ComponentType<GeneratedIconProps>
}

export type Transfer = [pending: boolean, transfer: () => Promise<string | undefined>]
