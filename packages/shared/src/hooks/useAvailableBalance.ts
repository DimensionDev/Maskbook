import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useFungibleTokenBalance, useNativeTokenBalance } from '@masknet/web3-hooks-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { isGreaterThan, isSameAddress, ZERO } from '@masknet/web3-shared-base'
import {
    type ChainId,
    type GasConfig,
    GasEditor,
    isNativeTokenAddress,
    formatEtherToWei,
} from '@masknet/web3-shared-evm'

export function useAvailableBalance<T extends NetworkPluginID = NetworkPluginID>(
    pluginID: T,
    address?: string,
    gasOption?: GasConfig,
    options?: ConnectionOptions<T>,
) {
    const { chainId } = useChainContext(options)
    const { value: nativeTokenBalance = '0' } = useNativeTokenBalance(pluginID, options)
    const { data: tokenBalance = '0', isPending: isLoadingTokenBalance } = useFungibleTokenBalance(pluginID, address, {
        ...options,
        chainId,
    })

    const gasFee = useMemo(() => {
        if (!gasOption?.gas || pluginID !== NetworkPluginID.PLUGIN_EVM) return ZERO
        const result = GasEditor.fromConfig(chainId as ChainId, gasOption).getGasFee(gasOption.gas)
        if (!gasOption.gasCurrency || isNativeTokenAddress(gasOption.gasCurrency)) return result
        return ZERO
    }, [gasOption, chainId, pluginID])

    const isGasFeeGreaterThanOneETH = useMemo(() => {
        if (!gasOption?.gas || pluginID !== NetworkPluginID.PLUGIN_EVM) return false
        return GasEditor.fromConfig(chainId as ChainId, gasOption)
            .getGasFee(gasOption.gas)
            .gte(formatEtherToWei(1))
    }, [gasOption, chainId, pluginID])

    const isGasSufficient = useMemo(() => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return true
        if (!gasOption?.gasCurrency || isNativeTokenAddress(gasOption.gasCurrency))
            return isGreaterThan(nativeTokenBalance, gasFee)
        return true
    }, [gasOption?.gasCurrency, nativeTokenBalance, gasFee, pluginID])

    const isAvailableBalance =
        isSameAddress(address, gasOption?.gasCurrency) ||
        isNativeTokenAddress(address) ||
        pluginID !== NetworkPluginID.PLUGIN_EVM
    const balance =
        isAvailableBalance && pluginID === NetworkPluginID.PLUGIN_EVM ?
            BigNumber.max(new BigNumber(tokenBalance).minus(gasFee), 0).toString()
        :   tokenBalance

    const result = {
        isAvailableBalance,
        isGasSufficient,
        isGasFeeGreaterThanOneETH,
        gasFee,
        balance,
        isPending: isLoadingTokenBalance,
    }

    console.log('DEBUG: useAvailableBalance', result)

    return result
}
