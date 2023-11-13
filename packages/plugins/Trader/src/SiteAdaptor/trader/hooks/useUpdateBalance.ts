import { useEffect } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { useChainContext, useBalance, useNetworkContext, useWeb3Utils } from '@masknet/web3-hooks-base'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../../trader/useAllProviderTradeContext.js'

export function useUpdateBalance(chainId: Web3Helper.ChainIdAll) {
    const { account } = useChainContext()
    const {
        tradeState: [{ inputToken, outputToken }, dispatchTradeStore],
    } = AllProviderTradeContext.useContainer()
    const { pluginID } = useNetworkContext()
    const Utils = useWeb3Utils()

    const { data: balance } = useBalance(pluginID, {
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
        if (Utils.isNativeTokenSchemaType(inputToken?.schema)) {
            dispatchTradeStore({
                type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
                balance: balance || '0',
            })
        }
    }, [account, inputToken?.schema, balance, Utils.isNativeTokenSchemaType])

    useEffect(() => {
        if (!account) return
        const value =
            Utils.isNativeTokenSchemaType(outputToken?.schema) || isNativeTokenAddress(outputToken?.address)
                ? balance
                : '0'
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
            balance: value || '0',
        })
    }, [account, outputToken?.schema, outputToken?.address, balance, Utils.isNativeTokenSchemaType])
}
