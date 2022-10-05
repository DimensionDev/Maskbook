import { compact, uniqBy } from 'lodash-unified'
import type { CollectionTypes, WalletsCollection, WalletTypes } from '@masknet/shared'
import { NetworkPluginID, BindingProof, joinKeys, NextIDPlatform, PersonaInformation } from '@masknet/shared-base'
import { AlchemyEVM, NextIDStorage, RSS3 } from '@masknet/web3-providers'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
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
    if (!listA?.length) return []
    if (!listB?.length) return [...listA]
    return listA.filter((l2) => !listB.some((l1) => isSameAddress(l2.address, l1.address)))
}

const addHiddenToArray = (listA?: CollectionTypes[], listB?: string[]) => {
    if (!listA?.length) return []
    if (!listB?.length) return [...listA]
    return listA.map((x) => {
        return {
            ...x,
            hidden: listB.includes(x.key),
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
    const allLinkedProfiles = allPersona?.flatMap((persona) => persona.linkedProfiles)
    // NextId can duplicate proof for twitter account and one persona
    const detailedAccounts = uniqBy(
        accounts.map((account) => {
            const linkedProfile = allLinkedProfiles?.find(
                (profile) =>
                    profile.identifier.network?.replace('.com', '') === NextIDPlatform.Twitter &&
                    profile.identifier.userId === account.identity,
            )
            return {
                ...account,
                linkedProfile,
            }
        }),
        (x) => x.platform + x.identity,
    )
    return detailedAccounts.map((detailedAccount) => {
        const hiddenWallet = hiddenObj?.hiddenWallets?.[detailedAccount.identity]
        const hiddenCollection = hiddenObj?.hiddenCollections?.[detailedAccount.identity]
        return {
            ...detailedAccount,
            walletList: {
                NFTs: deduplicateArray(wallets, hiddenWallet?.NFTs).map((wallet) => ({
                    ...wallet,
                    collections: addHiddenToArray(
                        NFTs?.find((NFT) => isSameAddress(NFT.address, wallet.address))?.collections,
                        hiddenCollection?.[wallet.address]?.NFTs,
                    ),
                })),
                donations: deduplicateArray(wallets, hiddenWallet?.donations).map((wallet) => ({
                    ...wallet,
                    collections: addHiddenToArray(
                        donations?.find((donation) => isSameAddress(donation.address, wallet.address))?.collections,
                        hiddenCollection?.[wallet.address]?.Donations,
                    ),
                })),
                footprints: deduplicateArray(wallets, hiddenWallet?.footprints).map((wallet) => ({
                    ...wallet,
                    collections: addHiddenToArray(
                        footprints?.find((footprint) => isSameAddress(footprint.address, wallet.address))?.collections,
                        hiddenCollection?.[wallet.address]?.Footprints,
                    ),
                })),
            } as WalletsCollection,
        }
    })
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
                footprints.map((footprint): CollectionTypes | null => {
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
        const collections: CollectionTypes[] = assets.map(
            (asset): CollectionTypes => ({
                key: `${asset.contract?.address}_${asset.tokenId}`,
                address: asset.address,
                platform,
                tokenId: asset.tokenId,
                imageURL: asset.metadata?.imageURL,
                name: asset.metadata?.name,
                chainId,
            }),
        )

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
    if (res.ok) {
        const hiddenWallets: Record<string, WalletsCollection> = {}
        const hiddenCollections: Record<
            string,
            Record<
                string,
                {
                    Donations: string[]
                    Footprints: string[]
                    NFTs: string[]
                }
            >
        > = {}
        res.val?.proofs
            ?.filter((x) => x.platform === NextIDPlatform.Twitter)
            ?.forEach((y) => {
                hiddenWallets[y.identity] = y.content?.[PLUGIN_ID]?.hiddenAddresses!
                hiddenCollections[y.identity] = y.content?.[PLUGIN_ID]?.unListedCollections!
            })
        return {
            hiddenWallets,
            hiddenCollections,
        }
    }
    return
}
