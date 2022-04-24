import { ChainId, SchemaType, isSameAddress, useAccount, useBalance, useTokenConstants } from '@masknet/web3-shared-evm'
import { useEffect } from 'react'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../../trader/useAllProviderTradeContext'

export function useUpdateBalance(chainId: ChainId) {
    const currentAccount = useAccount()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const {
        tradeState: [{ inputToken, outputToken }, dispatchTradeStore],
    } = AllProviderTradeContext.useContainer()
    const balance = useBalance(chainId)

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
        const value = inputToken?.type === SchemaType.Native ? balance.value : '0'
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
            balance: value || '0',
        })
    }, [currentAccount, inputToken?.type, balance.value])

    useEffect(() => {
        if (!currentAccount) return
        const value =
            outputToken?.type === SchemaType.Native || isSameAddress(outputToken?.address, NATIVE_TOKEN_ADDRESS)
                ? balance.value
                : '0'
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
            balance: value || '0',
        })
    }, [currentAccount, outputToken?.type, outputToken?.address, balance.value])
}
