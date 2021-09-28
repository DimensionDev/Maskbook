import { GasOption, isEIP1559Supported, useChainId } from '@masknet/web3-shared'
import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { useDashboardI18N } from '../locales'
import { PluginServices } from '../API'

const { Wallet: WalletRPC } = PluginServices
export function useGasOptions() {
    const t = useDashboardI18N()
    const chainId = useChainId()
    const is1559Supported = useMemo(() => isEIP1559Supported(chainId), [chainId])
    const { value: gasFromMetaMask, loading: getFromMetaMaskLoading } = useAsync(async () => {
        if (!is1559Supported) return

        return WalletRPC.getEstimateGasFees(chainId)
    }, [is1559Supported, chainId])

    //#region Get gas now from debank
    const { value: gasFromDebank, loading: getFromDebankLoading } = useAsync(async () => {
        if (is1559Supported) return
        const response = await WalletRPC.getGasPriceDictFromDeBank(chainId)
        if (!response) return null
        return {
            low: response.data.slow.price,
            medium: response.data.normal.price,
            high: response.data.fast.price,
        }
    }, [is1559Supported, chainId])
    //#endregion

    const gasNow = is1559Supported ? gasFromMetaMask : gasFromDebank

    const options = useMemo(() => {
        return [
            {
                title: t.wallet_gas_fee_settings_low(),
                gasOption: GasOption.Low,
                gasPrice: gasNow?.low ?? 0,
            },
            {
                title: t.wallet_gas_fee_settings_medium(),
                gasOption: GasOption.Medium,
                gasPrice: gasNow?.medium ?? 0,
            },
            {
                title: t.wallet_gas_fee_settings_high(),
                gasOption: GasOption.High,
                gasPrice: gasNow?.high ?? 0,
            },
        ]
    }, [is1559Supported, gasNow])

    return { value: options, loading: is1559Supported ? getFromMetaMaskLoading : getFromDebankLoading, gasNow }
}
