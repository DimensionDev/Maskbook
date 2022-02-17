import { useAsyncRetry } from 'react-use'
import type { AddressName } from '..'
import { useWeb3Context } from '../context'
import { AddressNameType } from '../types'
import { UserNFTContainerAtTwitter } from '@masknet/web3-providers'

export function useAddressNames(
    identity: {
        identifier: {
            userId: string
            network: string
        }
        avatar?: string
        bio?: string
        nickname?: string
        homepage?: string
    },
    sorter?: (a: AddressName, z: AddressName) => number,
) {
    const { getAddressNamesList } = useWeb3Context()

    return useAsyncRetry(async () => {
        const addressNames = await getAddressNamesList(identity)
        if (identity.identifier.network === 'twitter.com') {
            const { address } = await UserNFTContainerAtTwitter.getNFTContainerAtTwitter(
                identity.identifier.userId ?? '',
            )
            if (address)
                addressNames.push({
                    type: AddressNameType.TWITTER_BLUE,
                    label: address,
                    resolvedAddress: address,
                })
        }
        return sorter ? addressNames.sort(sorter) : addressNames
    }, [identity, getAddressNamesList])
}
