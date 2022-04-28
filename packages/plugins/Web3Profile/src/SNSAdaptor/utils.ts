import type { BindingProof } from '@masknet/shared-base'
import type { collection, WalletsCollection, walletTypes } from './types'

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
    hiddenObj: Record<string, WalletsCollection>,
    footprints: collection[],
    donations: collection[],
) => {
    if (wallets?.length === 0 || !hiddenObj || accounts?.length === 0) return
    return accounts?.map((key) => ({
        ...key,
        walletList: {
            NFTs: eduplicateArray(wallets, hiddenObj[key?.identity]?.NFTs),
            donations: eduplicateArray(wallets, hiddenObj[key?.identity]?.donations)?.map((wallet) => ({
                ...wallet,
                collections: donations?.find((donation) => donation?.address === wallet?.address)?.collections,
            })),
            footprints: eduplicateArray(wallets, hiddenObj[key?.identity]?.footprints)?.map((wallet) => ({
                ...wallet,
                collections: footprints?.find((footprint) => footprint?.address === wallet?.address)?.collections,
            })),
        },
    }))
}
