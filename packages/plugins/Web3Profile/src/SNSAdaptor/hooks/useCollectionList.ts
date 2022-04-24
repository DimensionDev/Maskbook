import {
    ERC721ContractDetailed,
    ERC721TokenCollectionInfo,
    ERC721TokenDetailed,
    formatEthereumAddress,
    isSameAddress,
} from '@masknet/web3-shared-evm'
import { uniqBy } from 'lodash-unified'
import { getDonations, getFootprints } from '../api'
import type { collectionTypes } from '../types'
export const getDonationList = async (walletList: string[]) => {
    const resNodeIdParams: collectionTypes[][] = []
    const promises = walletList.map((address) => {
        return getDonations(formatEthereumAddress(address)).then((result) => {
            if (result) {
                resNodeIdParams.push(
                    result?.assets?.map((asset) => ({
                        platform: asset?.platform,
                        iconURL: asset?.info?.image_preview_url,
                    })),
                )
            }
        })
    })
    await Promise.all(promises)
    return resNodeIdParams
}

export const getFootprintList = async (walletList: string[]) => {
    const resNodeIdParams: collectionTypes[][] = []
    const promises = walletList.map((address) => {
        return getFootprints(formatEthereumAddress(address)).then((result) => {
            if (result) {
                resNodeIdParams.push(
                    result?.assets?.map((asset) => ({
                        platform: asset?.platform,
                        iconURL: asset?.info?.image_preview_url,
                    })),
                )
            }
        })
    })
    await Promise.all(promises)
    return resNodeIdParams
}

export const getNFTList = (collectibles: ERC721TokenDetailed[], collectionsFormRemote: ERC721TokenCollectionInfo[]) => {
    return uniqBy(
        collectibles.map((x) => x.contractDetailed),
        (x) => x.address.toLowerCase(),
    )
        .map((x) => {
            const item = collectionsFormRemote.find((c) => isSameAddress(c.address, x.address))
            if (item) {
                return {
                    name: item.name,
                    symbol: item.name,
                    baseURI: item.iconURL,
                    iconURL: item.iconURL,
                    address: item.address,
                } as ERC721ContractDetailed
            }
            return x
        })
        .filter((collection) => collection?.iconURL)
}
