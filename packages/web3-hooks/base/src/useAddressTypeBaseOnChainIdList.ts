import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { attemptUntil } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'

export function useAddressTypeBaseOnChainIdList<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
>(
    pluginID?: T,
    address?: string,
    chainIdList?: Web3Helper.ChainIdAll[],
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection<S>(pluginID, options)
    const { Others } = useWeb3State(pluginID)
    return useAsyncRetry<Web3Helper.AddressTypeScope<S, T> | undefined>(async () => {
        if (!address || !Others?.isValidAddress(address) || !chainIdList || !connection?.getAddressType) return

        return attemptUntil(
            chainIdList.map((chainId) => async () => connection.getAddressType(address, { ...options, chainId })),
            await connection.getAddressType(address, options),
        )
    }, [address, connection, JSON.stringify(chainIdList), JSON.stringify(options)])
}
