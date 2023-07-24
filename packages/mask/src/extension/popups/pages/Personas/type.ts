import type { BindingProof } from '@masknet/shared-base'

export interface ConnectedWalletInfo extends BindingProof {
    name: string
}

export interface PersonaAvatarData {
    sign: string
    imageUrl: string
    updateAt: number
}
