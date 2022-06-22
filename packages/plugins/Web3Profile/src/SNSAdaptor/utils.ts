import { BindingProof, NextIDPlatform, PersonaInformation, ProfileInformation } from '@masknet/shared-base'
import type { Collection, CollectionTypes, WalletsCollection, WalletTypes } from './types'

export const formatPublicKey = (publicKey?: string) => {
    return `${publicKey?.slice(0, 6)}...${publicKey?.slice(-6)}`
}

export const formatAddress = (address: string, size = 4) => {
    return `${address?.slice(0, size)}...${address?.slice(-size)}`
}

const deduplicateArray = (listA?: WalletTypes[], listB?: WalletTypes[]) => {
    if (!listA || listA?.length === 0) return
    if (!listB || listB?.length === 0) return [...listA]
    return listA?.filter((l2) => listB.findIndex((l1) => l2.address === l1.address) === -1)
}

const addHiddenToArray = (listA?: CollectionTypes[], listB?: string[]) => {
    if (!listA || listA?.length === 0) return
    if (!listB || listB?.length === 0) return [...listA]
    return listA?.map((x) => {
        if (listB?.findIndex((y) => y === x.key) !== -1) {
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
    wallets: WalletTypes[],
    allPersona: PersonaInformation[],
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
                          NFTs: string[]
                      }
                  >
              >
          }
        | undefined,
    footprints?: Collection[],
    donations?: Collection[],
    NFTs?: Collection[],
) => {
    if (accounts?.length === 0) return
    let allLinkedProfiles: ProfileInformation[] = []
    allPersona?.forEach((persona) => {
        if (persona?.linkedProfiles) {
            allLinkedProfiles = [...allLinkedProfiles, ...persona.linkedProfiles]
        }
    })
    const detailedAccounts = accounts?.map((account) => {
        const linkedProfile = allLinkedProfiles?.find(
            (profile) =>
                profile?.identifier?.network?.replace('.com', '') === NextIDPlatform.Twitter &&
                profile?.identifier?.userId === account?.identity,
        )
        return {
            ...account,
            linkedProfile,
        }
    })
    return detailedAccounts?.map((key) => ({
        ...key,
        walletList: {
            NFTs: deduplicateArray(wallets, hiddenObj?.hiddenWallets[key?.identity]?.NFTs)?.map((wallet) => ({
                ...wallet,
                collections: addHiddenToArray(
                    NFTs?.find((NFT) => NFT?.address === wallet?.address)?.collections,
                    hiddenObj?.hiddenCollections?.[key?.identity]?.[wallet?.address]?.NFTs,
                ),
            })),
            donations: deduplicateArray(wallets, hiddenObj?.hiddenWallets[key?.identity]?.donations)?.map((wallet) => ({
                ...wallet,
                collections: addHiddenToArray(
                    donations?.find((donation) => donation?.address === wallet?.address)?.collections,
                    hiddenObj?.hiddenCollections?.[key?.identity]?.[wallet?.address]?.Donations,
                ),
            })),
            footprints: deduplicateArray(wallets, hiddenObj?.hiddenWallets[key?.identity]?.footprints)?.map(
                (wallet) => ({
                    ...wallet,
                    collections: addHiddenToArray(
                        footprints?.find((footprint) => footprint?.address === wallet?.address)?.collections,
                        hiddenObj?.hiddenCollections?.[key?.identity]?.[wallet?.address]?.Footprints,
                    ),
                }),
            ),
        },
    }))
}
