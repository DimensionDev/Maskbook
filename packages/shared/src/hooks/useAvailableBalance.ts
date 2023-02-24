import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    useChainContext,
    useFungibleTokenBalance,
    useMaskTokenAddress,
    useNativeTokenBalance,
} from '@masknet/web3-hooks-base'
import { SmartPayBundler } from '@masknet/web3-providers'
import { isGreaterThan, isSameAddress, toFixed, ZERO } from '@masknet/web3-shared-base'
import { DepositPaymaster, GasConfig, GasEditor, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useAsync } from 'react-use'

export function useAvailableBalance(
    address?: string,
    gasOption?: GasConfig,
    options?: Web3Helper.Web3ConnectionOptionsScope<void, NetworkPluginID.PLUGIN_EVM>,
) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>(options)
    const { value: nativeTokenBalance = '0' } = useNativeTokenBalance()
    const maskTokenAddress = useMaskTokenAddress()
    const { value: maskBalance = '0' } = useFungibleTokenBalance(undefined, maskTokenAddress)

    const { value: tokenBalance = '0' } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, address ?? '', {
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
        if (!gasOption?.gas) return ZERO
        const result = GasEditor.fromConfig(chainId, gasOption).getGasFee(gasOption.gas)
        if (!gasOption.gasCurrency || isNativeTokenAddress(gasOption.gasCurrency)) return result
        if (!currencyRatio) return ZERO
        return new BigNumber(toFixed(result.multipliedBy(currencyRatio), 0))
    }, [gasOption, chainId])

    const isAvailableBalance = useMemo(
        () => isSameAddress(address, gasOption?.gasCurrency) || isNativeTokenAddress(address),
        [address, gasOption?.gasCurrency],
    )

    const isAvailableGasBalance = useMemo(() => {
        if (!gasOption?.gasCurrency || isNativeTokenAddress(gasOption.gasCurrency))
            return isGreaterThan(nativeTokenBalance, gasFee)

        return isGreaterThan(maskBalance, gasFee)
    }, [gasOption?.gasCurrency, nativeTokenBalance, maskBalance, gasFee])

    return {
        isAvailableBalance,
        isAvailableGasBalance,
        balance: isAvailableBalance ? new BigNumber(tokenBalance).minus(gasFee).toString() : tokenBalance,
    }
}
