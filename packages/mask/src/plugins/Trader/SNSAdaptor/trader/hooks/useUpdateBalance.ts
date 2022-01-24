import {
    ChainId,
    useChainBalance,
    EthereumTokenType,
    useAccount,
    useProviderType,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../../trader/useAllProviderTradeContext'
import { useEffect } from 'react'

export function useUpdateBalance(chainId: ChainId) {
    const currentAccount = useAccount()
    const currentProvider = useProviderType()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const balance = useChainBalance(currentAccount, chainId, currentProvider)

    const {
        tradeState: [{ inputToken, outputToken }, dispatchTradeStore],
    } = AllProviderTradeContext.useContainer()

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
    }, [currentAccount])

    useEffect(() => {
        if (!balance.value || inputToken?.type !== EthereumTokenType.Native) return
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
            balance: balance.value,
        })
    }, [inputToken, NATIVE_TOKEN_ADDRESS, balance.value])

    useEffect(() => {
        if (!balance.value || inputToken?.type !== EthereumTokenType.Native) return
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
            balance: balance.value,
        })
    }, [outputToken, NATIVE_TOKEN_ADDRESS, balance.value])
}
