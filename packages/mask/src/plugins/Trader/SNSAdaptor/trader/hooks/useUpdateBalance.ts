import { useEffect } from 'react'
import { useChainContext, useBalance, useNetworkContext } from '@masknet/web3-hooks-base'
import { isNativeTokenAddress, SchemaType } from '@masknet/web3-shared-evm'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../../trader/useAllProviderTradeContext.js'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useUpdateBalance(chainId: Web3Helper.ChainIdAll) {
    const { account } = useChainContext()
    const {
        tradeState: [{ inputToken, outputToken }, dispatchTradeStore],
    } = AllProviderTradeContext.useContainer()
    const { pluginID } = useNetworkContext()

    const balance = useBalance(pluginID, {
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
