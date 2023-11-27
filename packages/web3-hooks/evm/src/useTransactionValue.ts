import { BigNumber } from 'bignumber.js'
import { useBalance, useChainContext, useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useGasConfig } from './useGasConfig.js'

export function useTransactionValue(
    originalValue?: BigNumber.Value,
    gas?: string,
    /** token address */ gasCurrency?: string,
) {
    const { data: nativeTokenBalance = '0', isPending: loadingBalance } = useBalance(NetworkPluginID.PLUGIN_EVM)
    const { data: gasCurrencyBalance = '0', isPending: loadingTokenBalance } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        gasCurrency,
    )

    const balance = gasCurrency ? gasCurrencyBalance : nativeTokenBalance
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    // #region amount minus estimate gas fee
    const { gasPrice } = useGasConfig(chainId)

    const estimateGasFee =
        !gas ? undefined
        : gasPrice && gasPrice !== '0' ? new BigNumber(gasPrice).multipliedBy(gas).multipliedBy(1.5).toFixed()
        : undefined

    const transactionValue =
        (
            new BigNumber(balance).isLessThan(
                new BigNumber(originalValue ?? '0').plus(new BigNumber(estimateGasFee ?? '0')),
            )
        ) ?
            new BigNumber(originalValue ?? '0').minus(estimateGasFee ?? '0').toFixed()
        :   (originalValue as string)

    return { transactionValue, estimateGasFee, loading: loadingBalance || loadingTokenBalance }
}
