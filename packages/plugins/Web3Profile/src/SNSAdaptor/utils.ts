import { BindingProof, NextIDPlatform, PersonaInformation, ProfileInformation } from '@masknet/shared-base'
import { formatEthereumAddress, resolveIPFSLinkFromURL } from '@masknet/web3-shared-evm'
import { getDonations, getFootprints, getNFTs, getPolygonNFTs } from './api'
import type { AccountType, Collection, CollectionTypes, WalletsCollection, WalletTypes } from './types'

export const formatPublicKey = (publicKey?: string) => {
    return `${publicKey?.slice(0, 6)}...${publicKey?.slice(-6)}`
}

export const mergeList = (listA?: WalletTypes[], listB?: WalletTypes[]) => {
    if (!listA || listA?.length === 0) return
    if (!listB || listB?.length === 0) return [...listA]
    return listA?.map((item, index) => {
        const listBCollection = listB?.find((itemB) => itemB.address === item.address)?.collections
        return {
            ...item,
            collections: [...(item?.collections ?? []), ...(listBCollection ?? [])],
        }
    })
}

export const formatAddress = (address: string, size = 4) => {
    return `${address?.slice(0, size + 2)}...${address?.slice(-size)}`
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

export const placeFirst = (userId?: string, accountList?: AccountType[]) => {
    if (!accountList || accountList?.length === 0) return accountList
    const currentAccountIndex = accountList?.findIndex((account) => account?.identity === userId?.toLowerCase())
    if (currentAccountIndex === -1) return accountList
    const currentItem = accountList?.splice(currentAccountIndex, 1)?.[0]
    return [currentItem, ...accountList]
}

export const getDonationList = async (walletList: string[]) => {
    const resNodeIdParams: Collection[] = []
    const promises = walletList.map((address) => {
        return getDonations(formatEthereumAddress(address)).then((result) => {
            if (result) {
                resNodeIdParams.push({
                    address,
                    collections: result?.assets?.map((asset) => ({
                        key: asset?.id,
                        address: asset?.id,
                        platform: asset?.platform,
                        iconURL: asset?.info?.image_preview_url ?? undefined,
                        name: asset?.info?.title ?? asset?.info?.collection,
                    })),
                })
            } else {
                resNodeIdParams.push({
                    address,
                })
            }
        })
    })
    await Promise.all(promises)
    return resNodeIdParams
}

export const getFootprintList = async (walletList: string[]) => {
    const resNodeIdParams: Collection[] = []
    const promises = walletList.map((address) => {
        return getFootprints(formatEthereumAddress(address)).then((result) => {
            if (result) {
                resNodeIdParams.push({
                    address,
                    collections: result?.assets?.map((asset) => ({
                        key: asset?.id,
                        address: asset?.id,
                        platform: asset?.platform,
                        iconURL: asset?.info?.image_preview_url ?? undefined,
                        name: asset?.info?.title ?? asset?.info?.collection,
                    })),
                })
            } else {
                resNodeIdParams.push({
                    address,
                })
            }
        })
    })
    await Promise.all(promises)
    return resNodeIdParams
}

export const getNFTList = async (walletList: string[]) => {
    const resNodeIdParams: Collection[] = []
    const promises = walletList.map((address) => {
        return getNFTs(formatEthereumAddress(address)).then((result) => {
            if (result) {
                resNodeIdParams.push({
                    address,
                    collections: result?.ownedNfts?.map((asset) => ({
                        key: `${asset?.contract?.address}+${Number.parseInt(asset.id?.tokenId, 16).toString()}`,
                        address: asset?.contract?.address,
                        platform: 'EVM',
                        tokenId: Number.parseInt(asset.id?.tokenId, 16).toString(),
                        iconURL: resolveIPFSLinkFromURL(
                            asset?.metadata?.image ||
                                asset?.metadata?.image_url ||
                                asset?.media?.[0]?.gateway ||
                                asset?.metadata?.animation_url ||
                                '',
                        ),
                        name: asset?.metadata?.name,
                    })),
                })
            } else {
                resNodeIdParams.push({
                    address,
                })
            }
        })
    })
    await Promise.all(promises)
    return resNodeIdParams
}

export const getNFTList_Polygon = async (walletList: string[]) => {
    const resNodeIdParams: Collection[] = []
    const promises = walletList.map((address) => {
        return getPolygonNFTs(formatEthereumAddress(address)).then((result) => {
            if (result) {
                resNodeIdParams.push({
                    address,
                    collections: result?.ownedNfts?.map((asset) => ({
                        key: `${asset?.contract?.address}+${Number.parseInt(asset.id?.tokenId, 16).toString()}`,
                        address: asset?.contract?.address,
                        platform: 'EVM',
                        tokenId: Number.parseInt(asset.id?.tokenId, 16).toString(),
                        iconURL: resolveIPFSLinkFromURL(
                            asset?.metadata?.image ||
                                asset?.metadata?.image_url ||
                                asset?.media?.[0]?.gateway ||
                                asset?.metadata?.animation_url ||
                                '',
                        ),
                    })),
                })
            } else {
                resNodeIdParams.push({
                    address,
                })
            }
        })
    })
    await Promise.all(promises)
    return resNodeIdParams
}
