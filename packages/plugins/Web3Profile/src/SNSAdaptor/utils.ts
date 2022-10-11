import { compact, uniqBy } from 'lodash-unified'
import type { CollectionTypes, WalletsCollection, WalletTypes } from '@masknet/shared'
import {
    NetworkPluginID,
    BindingProof,
    joinKeys,
    NextIDPlatform,
    PersonaInformation,
    EMPTY_LIST,
} from '@masknet/shared-base'
import { AlchemyEVM, NextIDStorage, RSS3 } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { PLUGIN_ID } from '../constants.js'
import type { Collection, UnlistedConfig, PersonaKV } from './types.js'

const removeUnlistedWallets = (listA?: WalletTypes[], listB?: WalletTypes[]) => {
    if (!listA?.length) return []
    if (!listB?.length) return [...listA]
    return listA.filter((l2) => !listB.some((l1) => isSameAddress(l2.address, l1.address)))
}

export const getWalletList = (
    accounts: BindingProof[],
    wallets: WalletTypes[],
    allPersona: PersonaInformation[],
    unlistedConfig: UnlistedConfig | undefined,
    footprints: Collection[] = [],
    donations: Collection[] = [],
    NFTs: Collection[] = [],
) => {
    if (accounts?.length === 0) return EMPTY_LIST
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
        const unlistedWallet = unlistedConfig?.wallets?.[detailedAccount.identity]
        return {
            ...detailedAccount,
            walletList: {
                NFTs: removeUnlistedWallets(wallets, unlistedWallet?.NFTs).map((wallet) => ({
                    ...wallet,
                    collections: NFTs?.find((x) => isSameAddress(x.address, wallet.address))?.collections,
                })),
                donations: removeUnlistedWallets(wallets, unlistedWallet?.donations).map((wallet) => ({
                    ...wallet,
                    collections: donations?.find((x) => isSameAddress(x.address, wallet.address))?.collections,
                })),
                footprints: removeUnlistedWallets(wallets, unlistedWallet?.footprints).map((wallet) => ({
                    ...wallet,
                    collections: footprints?.find((x) => isSameAddress(x.address, wallet.address))?.collections,
                })),
            } as WalletsCollection,
        }
    })
}

export const getDonationList = async (wallets: WalletTypes[]) => {
    const promises = wallets.map(async ({ address, networkPluginID }) => {
        const { data: donations } = await RSS3.getDonations(address)
        return {
            address,
            collections: donations.map((donation): CollectionTypes => {
                const action = donation.actions[0]
                return {
                    // TODO add a `getDonationKey()` function to hide the details behind
                    key: joinKeys(donation.hash, action.index),
                    address: donation.address_to ?? action.metadata?.token.contract_address ?? ZERO_ADDRESS,
                    networkPluginID: networkPluginID ?? NetworkPluginID.PLUGIN_EVM,
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
    const promises = walletList.map(async ({ address, networkPluginID = NetworkPluginID.PLUGIN_EVM }) => {
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
                        networkPluginID,
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

export const getNFTList = async (walletList: WalletTypes[], chainIds: ChainId[]) => {
    const promises = walletList.map(async ({ address, networkPluginID = NetworkPluginID.PLUGIN_EVM }) => {
        const chainPromises = chainIds.map(async (chainId) => {
            const { data } = await AlchemyEVM.getAssets(address, { chainId })
            // Discard assets without name and imageURL
            const assets = data.filter((x) => x.metadata?.name || x.metadata?.imageURL)
            const collections: CollectionTypes[] = assets.map(
                (asset): CollectionTypes => ({
                    key: `${asset.contract?.address}_${asset.tokenId}`,
                    address: asset.address,
                    networkPluginID,
                    tokenId: asset.tokenId,
                    imageURL: asset.metadata?.imageURL,
                    name: asset.metadata?.name,
                    chainId,
                }),
            )
            return collections
        })
        const collections = await Promise.all(chainPromises)
        return {
            address,
            collections: collections.flat(),
        }
    })
    const collections = await Promise.all(promises)
    return collections
}

export const getUnlistedConfig = async (publicKey: string): Promise<UnlistedConfig | undefined> => {
    if (!publicKey) return

    const res = await NextIDStorage.get<PersonaKV>(publicKey)
    if (!res.ok) return

    const wallets: UnlistedConfig['wallets'] = {}
    const collections: UnlistedConfig['collections'] = {}

    res.val.proofs
        ?.filter((x) => x.platform === NextIDPlatform.Twitter)
        ?.forEach((y) => {
            wallets[y.identity] = y.content?.[PLUGIN_ID]?.hiddenAddresses!
            collections[y.identity] = y.content?.[PLUGIN_ID]?.unListedCollections!
        })
    return {
        wallets,
        collections,
    }
}
