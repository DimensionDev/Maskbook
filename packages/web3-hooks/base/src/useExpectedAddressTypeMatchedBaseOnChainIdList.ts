import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { attemptUntilExpectResultMatched } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import type { AddressType } from '@masknet/web3-shared-evm'

export function useExpectedAddressTypeMatchedBaseOnChainIdList<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
>(
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

        return attemptUntilExpectResultMatched(
            chainIdList.map((chainId) => async () => connection.getAddressType(address, { ...options, chainId })),
            expectedAddressType,
        )
    }, [address, connection, JSON.stringify(chainIdList), expectedAddressType, JSON.stringify(options)])
}
