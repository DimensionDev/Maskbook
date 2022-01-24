import {
    ChainId,
    useChainBalance,
    EthereumTokenType,
    isSameAddress,
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
        if (!balance.value) return
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
            balance: inputToken?.type === EthereumTokenType.Native ? balance.value : '0',
        })

        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
            balance:
                isSameAddress(outputToken?.address, NATIVE_TOKEN_ADDRESS) ||
                outputToken?.type === EthereumTokenType.Native
                    ? balance.value
                    : '0',
        })
    }, [inputToken, outputToken, NATIVE_TOKEN_ADDRESS, balance.value])
}
