import type { NextIDPlatform, BindingProof, ProfileInformation } from '@masknet/web3-shared-base'

export interface Account extends ProfileInformation {
    is_valid?: boolean
    identity?: string
    platform?: NextIDPlatform
}

export interface ConnectedWalletInfo extends BindingProof {
    name: string
}
