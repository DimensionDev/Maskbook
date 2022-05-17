import { useAsyncRetry } from 'react-use'
import { CurrencyType, GasOptionType, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'

export function useGasOptions<T extends NetworkPluginID>(pluginID?: T, currencyType = CurrencyType.USD) {
    type GetGasOptions = (
        chainId: Web3Helper.Definition[T]['ChainId'],
        currencyType: CurrencyType,
    ) => Promise<Record<GasOptionType, Web3Helper.Definition[T]['GasOption']>>

    const chainId = useChainId(pluginID)
    const { GasOptions } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (!chainId || !GasOptions) return
        return (GasOptions.getGasOptions as GetGasOptions)(chainId, currencyType)
    }, [chainId, currencyType, GasOptions])
}
