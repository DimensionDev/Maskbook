import { useAsyncRetry } from 'react-use'
import type { AddressName } from '..'
import { useWeb3Context } from '../context'

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
        return sorter ? addressNames.sort(sorter) : addressNames
    }, [identity, getAddressNamesList])
}
