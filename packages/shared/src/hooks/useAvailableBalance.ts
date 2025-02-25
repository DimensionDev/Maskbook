import { NetworkPluginID } from '@masknet/shared-base'
import {
    useChainContext,
    useFungibleTokenBalance,
    useMaskTokenAddress,
    useNativeTokenBalance,
} from '@masknet/web3-hooks-base'
import { DepositPaymaster, SmartPayBundler } from '@masknet/web3-providers'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { isGreaterThan, isSameAddress, toFixed, ZERO } from '@masknet/web3-shared-base'
import {
    type ChainId,
    formatEtherToWei,
    type GasConfig,
    GasEditor,
    isNativeTokenAddress,
} from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'

export function useAvailableBalance<T extends NetworkPluginID = NetworkPluginID>(
    pluginID: T,
    address?: string,
    gasOption?: GasConfig,
    options?: ConnectionOptions<T>,
) {
    const { chainId } = useChainContext(options)
    const { value: nativeTokenBalance = '0' } = useNativeTokenBalance(pluginID, options)
    const maskTokenAddress = useMaskTokenAddress(pluginID, options)
    const { data: maskBalance = '0', isPending: isLoadingMaskBalance } = useFungibleTokenBalance(
        undefined,
        maskTokenAddress,
    )
    const { data: tokenBalance = '0', isPending: isLoadingTokenBalance } = useFungibleTokenBalance(pluginID, address, {
        ...options,
        chainId,
    })

    // #region paymaster ratio
    const { data: currencyRatio, isLoading: loading } = useQuery({
        queryKey: ['currency-ratio', chainId],
        queryFn: async () => {
            const chainId = await SmartPayBundler.getSupportedChainId()
            const depositPaymaster = new DepositPaymaster(chainId)
            const ratio = await depositPaymaster.getRatio()

            return ratio
        },
    })
    // #endregion

    const gasFee = useMemo(() => {
        if (pluginID === NetworkPluginID.PLUGIN_SOLANA && gasOption?.gas) return new BigNumber(gasOption.gas)
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
        () => isSameAddress(address, gasOption?.gasCurrency) || isNativeTokenAddress(address),
        [address, gasOption?.gasCurrency, pluginID],
    )

    const isGasSufficient = useMemo(() => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return true
        if (!gasOption?.gasCurrency || isNativeTokenAddress(gasOption.gasCurrency))
            return isGreaterThan(nativeTokenBalance, gasFee)

        return isGreaterThan(maskBalance, gasFee)
    }, [gasOption?.gasCurrency, nativeTokenBalance, maskBalance, gasFee, pluginID])

    const balance =
        isAvailableBalance ? BigNumber.max(new BigNumber(tokenBalance).minus(gasFee), 0).toString() : tokenBalance

    return {
        isAvailableBalance,
        isGasSufficient,
        isGasFeeGreaterThanOneETH,
        gasFee,
        balance,
        isPending: isLoadingMaskBalance || isLoadingTokenBalance || loading,
    }
}
