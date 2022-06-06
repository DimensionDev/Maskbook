import { useEffect } from 'react'
import { useAccount, useBalance } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, useTokenConstants } from '@masknet/web3-shared-evm'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../../trader/useAllProviderTradeContext'

export function useUpdateBalance(chainId: ChainId) {
    const currentAccount = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const {
        tradeState: [{ inputToken, outputToken }, dispatchTradeStore],
    } = AllProviderTradeContext.useContainer()
    const balance = useBalance(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })

    useEffect(() => {
        if (currentAccount) return
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
            balance: '0',
        })

        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
            balance: '0',
        })
        return
    }, [currentAccount])

    useEffect(() => {
        if (!currentAccount) return
        const value = inputToken?.schema === SchemaType.Native ? balance.value : '0'
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
            balance: value || '0',
        })
    }, [currentAccount, inputToken?.schema, balance.value])

    useEffect(() => {
        if (!currentAccount) return
        const value =
            outputToken?.schema === SchemaType.Native || isSameAddress(outputToken?.address, NATIVE_TOKEN_ADDRESS)
                ? balance.value
                : '0'
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
            balance: value || '0',
        })
    }, [currentAccount, outputToken?.schema, outputToken?.address, balance.value])
}
