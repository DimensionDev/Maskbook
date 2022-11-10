import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { attemptUntil } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import type { AddressType } from '@masknet/web3-shared-evm'

export function useAddressTypeMatched<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    chainIdList?: Web3Helper.ChainIdAll[],
    expectedAddressType?: AddressType,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection<S>(pluginID, options)
    const { Others } = useWeb3State(pluginID)
    return useAsyncRetry<boolean | undefined>(async () => {
        if (!address || !Others?.isValidAddress(address) || !chainIdList || !connection?.getAddressType) return

        const addressType = await attemptUntil(
            chainIdList.map((chainId) => async () => {
                const addressType = await connection.getAddressType(address, { ...options, chainId })
                if (addressType !== expectedAddressType) throw new Error('')
                return addressType
            }),
            undefined,
        )

        return expectedAddressType === addressType
    }, [address, connection, JSON.stringify(chainIdList), expectedAddressType, JSON.stringify(options)])
}
