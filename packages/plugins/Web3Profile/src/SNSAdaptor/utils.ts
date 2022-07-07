import {
    BindingProof,
    fromHex,
    NextIDPlatform,
    NextIDStoragePayload,
    PersonaInformation,
    ProfileInformation,
    toBase64,
} from '@masknet/shared-base'
import { Alchemy_EVM, NextIDStorage, RSS3 } from '@masknet/web3-providers'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { isSameAddress } from '../../../../web3-shared/base/src/utils'
import { PLUGIN_ID } from '../constants'
import type { AccountType, Collection, CollectionTypes, PersonaKV, WalletsCollection, WalletTypes } from './types'

export const formatPublicKey = (publicKey?: string) => {
    return `${publicKey?.slice(0, 6)}...${publicKey?.slice(-6)}`
}

export const mergeList = (listA?: WalletTypes[], listB?: WalletTypes[]) => {
    if (!listA || listA?.length === 0) return listB
    if (!listB || listB?.length === 0) return [...listA]
    return listA?.map((item, index) => {
        const listBCollection = listB?.find((itemB) => isSameAddress(itemB.address, item.address))?.collections
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
    return listA?.filter((l2) => listB.findIndex((l1) => isSameAddress(l2.address, l1.address)) === -1)
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
                    NFTs?.find((NFT) => isSameAddress(NFT?.address, wallet?.address))?.collections,
                    hiddenObj?.hiddenCollections?.[key?.identity]?.[wallet?.address]?.NFTs,
                ),
            })),
            donations: deduplicateArray(wallets, hiddenObj?.hiddenWallets[key?.identity]?.donations)?.map((wallet) => ({
                ...wallet,
                collections: addHiddenToArray(
                    donations?.find((donation) => isSameAddress(donation?.address, wallet?.address))?.collections,
                    hiddenObj?.hiddenCollections?.[key?.identity]?.[wallet?.address]?.Donations,
                ),
            })),
            footprints: deduplicateArray(wallets, hiddenObj?.hiddenWallets[key?.identity]?.footprints)?.map(
                (wallet) => ({
                    ...wallet,
                    collections: addHiddenToArray(
                        footprints?.find((footprint) => isSameAddress(footprint?.address, wallet?.address))
                            ?.collections,
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
        return RSS3.getDonations(formatEthereumAddress(address)).then((result) => {
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
        return RSS3.getFootprints(formatEthereumAddress(address)).then((result) => {
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
        return Alchemy_EVM.getAssets(formatEthereumAddress(address), { chainId: ChainId.Mainnet }).then((result) => {
            if (result) {
                resNodeIdParams.push({
                    address,
                    collections: result?.data?.map((asset) => ({
                        key: `${asset?.contract?.address}+${asset.tokenId}`,
                        address: asset?.address,
                        platform: 'EVM',
                        tokenId: asset.tokenId,
                        iconURL: asset?.metadata?.imageURL,
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
        return Alchemy_EVM.getAssets(formatEthereumAddress(address), { chainId: ChainId.Matic }).then((result) => {
            if (result) {
                resNodeIdParams.push({
                    address,
                    collections: result?.data?.map((asset) => ({
                        key: `${asset?.contract?.address}+${asset.tokenId}`,
                        address: asset?.address,
                        platform: 'EVM',
                        tokenId: asset.tokenId,
                        iconURL: asset?.metadata?.imageURL,
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

export const getWalletHiddenList = async (publicKey: string) => {
    if (!publicKey) return
    const res = await NextIDStorage.get<PersonaKV>(publicKey)
    const hiddenObj:
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
        | undefined = { hiddenWallets: {}, hiddenCollections: {} }
    if (res) {
        ;(res?.val as PersonaKV)?.proofs
            ?.filter((x) => x.platform === NextIDPlatform.Twitter)
            ?.forEach((y) => {
                hiddenObj.hiddenWallets[y.identity] = y?.content?.[PLUGIN_ID]?.hiddenAddresses!
                hiddenObj.hiddenCollections[y.identity] = y?.content?.[PLUGIN_ID]?.unListedCollections!
            })
        return hiddenObj
    }
    return
}

export const getKvPayload = async (patchData: unknown, publicHexKey: string, accountId: string) => {
    try {
        const data = JSON.parse(JSON.stringify(patchData))
        const payload = await NextIDStorage.getPayload(publicHexKey, NextIDPlatform.Twitter, accountId, data, PLUGIN_ID)
        return payload
    } catch (error) {
        console.error(error)
        return null
    }
}

export const setKvPatchData = async (
    payload: NextIDStoragePayload,
    signature: string,
    patchData: unknown,
    publicHexKey: string,
    accountId: string,
) => {
    try {
        const base64Sig = toBase64(fromHex(signature))
        await NextIDStorage.set(
            payload?.uuid,
            publicHexKey,
            base64Sig,
            NextIDPlatform.Twitter,
            accountId,
            payload?.createdAt,
            patchData,
            PLUGIN_ID,
        )
    } catch (error) {
        console.error(error)
    }
}
