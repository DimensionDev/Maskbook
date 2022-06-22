import { formatEthereumAddress, resolveIPFSLinkFromURL } from '@masknet/web3-shared-evm'
import { getDonations, getFootprints, getNFTs } from '../api'
import type { Collection } from '../types'
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
