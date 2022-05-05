import type { BindingProof } from '@masknet/shared-base'
import type { collection, collectionTypes, WalletsCollection, walletTypes } from './types'

export const formatPublicKey = (publicKey?: string) => {
    return `${publicKey?.slice(0, 6)}...${publicKey?.slice(-6)}`
}

export const formatAddress = (address: string, size = 4) => {
    return `${address?.slice(0, size)}...${address?.slice(-size)}`
}

const eduplicateArray = (listA?: walletTypes[], listB?: walletTypes[]) => {
    if (!listA || listA?.length === 0) return
    if (!listB || listB?.length === 0) return [...listA]
    return listA?.filter((l2) => listB.findIndex((l1) => l2.address === l1.address) === -1)
}

const addHiddenToArray = (listA?: collectionTypes[], listB?: string[]) => {
    if (!listA || listA?.length === 0) return
    if (!listB || listB?.length === 0) return [...listA]
    return listA?.map((x) => {
        if (listB?.findIndex((y) => y === x.iconURL) !== -1) {
            return {
                ...x,
                hidden: true,
            }
        }
        return {
            ...x,
            hidden: false,
        }
    })
}

export const getWalletList = (
    accounts: BindingProof[],
    wallets: walletTypes[],
    hiddenObj:
        | {
              hiddenWallets: Record<string, WalletsCollection>
              hiddenCollections: Record<
                  string,
                  Record<
                      string,
                      {
                          Donations: string[]
                          Footprints: string[]
                      }
                  >
              >
          }
        | undefined,
    footprints?: collection[],
    donations?: collection[],
) => {
    if (wallets?.length === 0 || !hiddenObj || accounts?.length === 0) return
    return accounts?.map((key) => ({
        ...key,
        walletList: {
            NFTs: eduplicateArray(wallets, hiddenObj.hiddenWallets[key?.identity]?.NFTs),
            donations: eduplicateArray(wallets, hiddenObj.hiddenWallets[key?.identity]?.donations)?.map((wallet) => ({
                ...wallet,
                collections: addHiddenToArray(
                    donations?.find((donation) => donation?.address === wallet?.address)?.collections,
                    hiddenObj.hiddenCollections?.[key?.identity]?.[wallet?.address]?.Donations,
                ),
            })),
            footprints: eduplicateArray(wallets, hiddenObj.hiddenWallets[key?.identity]?.footprints)?.map((wallet) => ({
                ...wallet,
                collections: addHiddenToArray(
                    footprints?.find((footprint) => footprint?.address === wallet?.address)?.collections,
                    hiddenObj.hiddenCollections?.[key?.identity]?.[wallet?.address]?.Footprints,
                ),
            })),
        },
    }))
}
