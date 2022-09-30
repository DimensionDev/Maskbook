import type { CollectionTypes, WalletsCollection, WalletTypes } from '@masknet/shared'
import { BindingProof, joinKeys, NextIDPlatform, PersonaInformation } from '@masknet/shared-base'
import { AlchemyEVM, NextIDStorage, RSS3 } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { compact, uniqBy } from 'lodash-unified'
import { isSameAddress } from '../../../../web3-shared/base/src/utils/index.js'
import { PLUGIN_ID } from '../constants.js'
import type { Collection, PersonaKV } from './types.js'

export const formatPublicKey = (publicKey?: string) => {
    return `${publicKey?.slice(0, 6)}...${publicKey?.slice(-6)}`
}

export const mergeList = (listA: WalletTypes[], listB: WalletTypes[]) => {
    return listA.map((item) => {
        const listBCollection = listB.find((itemB) => isSameAddress(itemB.address, item.address))?.collections
        return {
            ...item,
            collections: [...(item?.collections ?? []), ...(listBCollection ?? [])],
        }
    })
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
    const allLinkedProfiles = allPersona?.flatMap((persona) => persona?.linkedProfiles)
    // NextId can duplicate proof for twitter account and one persona
    const detailedAccounts = uniqBy(
        accounts?.map((account) => {
            const linkedProfile = allLinkedProfiles?.find(
                (profile) =>
                    profile?.identifier?.network?.replace('.com', '') === NextIDPlatform.Twitter &&
                    profile?.identifier?.userId === account?.identity,
            )
            return {
                ...account,
                linkedProfile,
            }
        }),
        (x) => x.platform + x.identity,
    )
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

export const getDonationList = async (walletList: WalletTypes[]) => {
    const promises = walletList.map(async ({ address, platform }) => {
        const { data: donations } = await RSS3.getDonations(address)
        return {
            address,
            collections: donations.map((donation): CollectionTypes => {
                const action = donation.actions[0]
                return {
                    // TODO add a `getDonationKey()` function to hide the details behind
                    key: joinKeys(donation.hash, action.index),
                    address: donation.address_to ?? action.metadata?.token.contract_address ?? ZERO_ADDRESS,
                    platform: platform ?? NetworkPluginID.PLUGIN_EVM,
                    imageURL: action.metadata?.logo,
                    name: action.metadata?.title,
                }
            }),
        }
    })
    const collections = await Promise.all(promises)
    return collections
}

export const getFootprintList = async (walletList: WalletTypes[]) => {
    const promises = walletList.map(async ({ address, platform = NetworkPluginID.PLUGIN_EVM }) => {
        const { data: footprints } = await RSS3.getFootprints(address)
        return {
            address,
            collections: compact(
                footprints.map((footprint) => {
                    const { metadata } = footprint.actions[0]
                    if (!metadata) return null
                    return {
                        // TODO add a `getFootprintKey()` function to hide the details behind
                        key: joinKeys(metadata.contract_address, metadata.id),
                        address: metadata.contract_address,
                        platform,
                        imageURL: metadata.image,
                        name: metadata.name,
                    }
                }),
            ),
        }
    })
    const collections = await Promise.all(promises)
    return collections
}

export const getNFTList = async (walletList: WalletTypes[], chainId: ChainId = ChainId.Mainnet) => {
    const promises = walletList.map(async ({ address, platform = NetworkPluginID.PLUGIN_EVM }) => {
        const { data } = await AlchemyEVM.getAssets(address, { chainId })
        // Discard assets without name and imageURL
        const assets = data.filter((x) => x.metadata?.name || x.metadata?.imageURL)
        const collections: CollectionTypes[] = assets.map((asset) => ({
            key: `${asset.contract?.address}_${asset.tokenId}`,
            address: asset.address,
            platform,
            tokenId: asset.tokenId,
            imageURL: asset.metadata?.imageURL,
            name: asset.metadata?.name,
            chainId,
        }))

        return {
            address,
            collections,
        }
    })
    const collections = await Promise.all(promises)
    return collections
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
