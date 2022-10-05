import { useEffect } from 'react'
import { useAccount, useBalance } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId, isNativeTokenAddress, SchemaType } from '@masknet/web3-shared-evm'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../../trader/useAllProviderTradeContext.js'

export function useUpdateBalance(chainId: ChainId) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const {
        tradeState: [{ inputToken, outputToken }, dispatchTradeStore],
    } = AllProviderTradeContext.useContainer()
    const balance = useBalance(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })

    useEffect(() => {
        if (account) return
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
            balance: '0',
        })

        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
            balance: '0',
        })
        return
    }, [account])

    useEffect(() => {
        if (!account) return
        if (inputToken?.schema === SchemaType.Native) {
            dispatchTradeStore({
                type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
                balance: balance.value || '0',
            })
        }
    }, [account, inputToken?.schema, balance.value])

    useEffect(() => {
        if (!account) return
        const value =
            outputToken?.schema === SchemaType.Native || isNativeTokenAddress(outputToken?.address)
                ? balance.value
                : '0'
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
            balance: value || '0',
        })
    }, [account, outputToken?.schema, outputToken?.address, balance.value])
}
