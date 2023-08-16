import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { BigNumber } from 'bignumber.js'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    useChainContext,
    useFungibleTokenBalance,
    useMaskTokenAddress,
    useNativeTokenBalance,
    useNetworkBy,
} from '@masknet/web3-hooks-base'
import { DepositPaymaster, SmartPayBundler } from '@masknet/web3-providers'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { isGreaterThan, isSameAddress, toFixed, ZERO } from '@masknet/web3-shared-base'
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
    const maskTokenAddress = useMaskTokenAddress(pluginID, options)
    const { data: maskBalance = '0', isLoading: isLoadingMaskBalance } = useFungibleTokenBalance(
        undefined,
        maskTokenAddress,
    )
    const network = useNetworkBy(pluginID, chainId)
    const { data: tokenBalance = '0', isLoading: isLoadingTokenBalance } = useFungibleTokenBalance(pluginID, address, {
        chainId,
        providerURL: network?.rpcUrl,
    })

    // #region paymaster ratio
    const { value: currencyRatio, loading } = useAsync(async () => {
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

    const isGasSufficient = useMemo(() => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return true
        if (!gasOption?.gasCurrency || isNativeTokenAddress(gasOption.gasCurrency))
            return isGreaterThan(nativeTokenBalance, gasFee)

        return isGreaterThan(maskBalance, gasFee)
    }, [gasOption?.gasCurrency, nativeTokenBalance, maskBalance, gasFee, pluginID])

    const balance =
        isAvailableBalance && pluginID === NetworkPluginID.PLUGIN_EVM
            ? BigNumber.max(new BigNumber(tokenBalance).minus(gasFee), 0).toString()
            : tokenBalance

    return {
        isAvailableBalance,
        isGasSufficient,
        isGasFeeGreaterThanOneETH,
        gasFee,
        balance,
        isLoading: isLoadingMaskBalance || isLoadingTokenBalance || loading,
    }
}
