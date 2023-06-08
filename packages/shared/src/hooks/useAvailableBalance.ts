import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { BigNumber } from 'bignumber.js'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    useChainContext,
    useFungibleTokenBalance,
    useMaskTokenAddress,
    useNativeTokenBalance,
} from '@masknet/web3-hooks-base'
import { SmartPayBundler } from '@masknet/web3-providers'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { isGreaterThan, isSameAddress, toFixed, ZERO } from '@masknet/web3-shared-base'
import {
    type ChainId,
    DepositPaymaster,
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
    const maskTokenAddress = useMaskTokenAddress(pluginID, options)
    const { value: maskBalance = '0' } = useFungibleTokenBalance(undefined, maskTokenAddress)

    const { value: tokenBalance = '0' } = useFungibleTokenBalance(pluginID, address ?? '', {
        chainId,
    })

    // #region paymaster ratio
    const { value: currencyRatio } = useAsync(async () => {
        const chainId = await SmartPayBundler.getSupportedChainId()
        const depositPaymaster = new DepositPaymaster(chainId)
        const ratio = await depositPaymaster.getRatio()

        return ratio
    }, [])
    // #endregion

    const gasFee = useMemo(() => {
        if (!gasOption?.gas || pluginID !== NetworkPluginID.PLUGIN_EVM) return ZERO
        const result = GasEditor.fromConfig(chainId as ChainId, gasOption).getGasFee(gasOption.gas)
        if (!gasOption.gasCurrency || isNativeTokenAddress(gasOption.gasCurrency)) return result
        if (!currencyRatio) return ZERO
        return new BigNumber(toFixed(result.multipliedBy(currencyRatio), 0))
    }, [gasOption, chainId, pluginID])

    const isGasFeeGreaterThanOneETH = useMemo(() => {
        if (!gasOption?.gas || pluginID !== NetworkPluginID.PLUGIN_EVM) return false
        return GasEditor.fromConfig(chainId as ChainId, gasOption)
            .getGasFee(gasOption.gas)
            .gte(formatEtherToWei(1))
    }, [gasOption, chainId, pluginID])

    const isAvailableBalance = useMemo(
        () =>
            isSameAddress(address, gasOption?.gasCurrency) ||
            isNativeTokenAddress(address) ||
            pluginID !== NetworkPluginID.PLUGIN_EVM,
        [address, gasOption?.gasCurrency, pluginID],
    )

    const isAvailableGasBalance = useMemo(() => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return true
        if (!gasOption?.gasCurrency || isNativeTokenAddress(gasOption.gasCurrency))
            return isGreaterThan(nativeTokenBalance, gasFee)

        return isGreaterThan(maskBalance, gasFee)
    }, [gasOption?.gasCurrency, nativeTokenBalance, maskBalance, gasFee, pluginID])

    return {
        isAvailableBalance,
        isAvailableGasBalance,
        isGasFeeGreaterThanOneETH,
        balance:
            isAvailableBalance && pluginID === NetworkPluginID.PLUGIN_EVM
                ? BigNumber.max(new BigNumber(tokenBalance).minus(gasFee), 0).toString()
                : tokenBalance,
    }
}
