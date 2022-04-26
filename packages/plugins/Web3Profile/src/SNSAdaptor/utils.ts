import type { BindingProof } from '@masknet/shared-base'
import type { WalletsCollection, walletTypes } from './types'

export const formatPublicKey = (publicKey?: string) => {
    return `${publicKey?.slice(0, 6)}...${publicKey?.slice(-6)}`
}

export const formatAddress = (address: string, size = 4) => {
    return `${address?.slice(0, size)}...${address?.slice(-size)}`
}

export const eduplicateArray = (listA?: walletTypes[], listB?: walletTypes[]) => {
    if (!listA || listA?.length === 0) return
    if (!listB || listB?.length === 0) return [...listA]
    return listA?.filter((l2) => listB.findIndex((l1) => l2.address === l1.address) === -1)
}

export const getWalletList = (
    accounts: BindingProof[],
    wallets: walletTypes[],
    hiddenObj: Record<string, { hiddenAddresses: WalletsCollection }>,
) => {
    if (wallets?.length === 0 || !hiddenObj || accounts?.length === 0) return
    return accounts?.map((key) => ({
        ...key,
        walletList: {
            NFTs: eduplicateArray(wallets, hiddenObj[`twitter_${key?.identity}`]?.hiddenAddresses?.NFTs),
            donations: eduplicateArray(wallets, hiddenObj[`twitter_${key?.identity}`]?.hiddenAddresses?.donations),
            footprints: eduplicateArray(wallets, hiddenObj[`twitter_${key?.identity}`]?.hiddenAddresses?.footprints),
        },
    }))
}
