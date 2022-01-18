import {
    ChainId,
    EthereumTokenType,
    isSameAddress,
    useAccount,
    useProviderType,
    useTokenConstants,
    useWeb3,
} from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../../trader/useAllProviderTradeContext'

export function useUpdateBalance(chainId: ChainId, currentChainId: ChainId) {
    const web3 = useWeb3(true, chainId)
    const currentAccount = useAccount()
    const currentProvider = useProviderType()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const {
        tradeState: [{ inputToken, outputToken }, dispatchTradeStore],
    } = AllProviderTradeContext.useContainer()

    return useAsync(async () => {
        if (!currentAccount) {
            dispatchTradeStore({
                type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
                balance: '0',
            })

            dispatchTradeStore({
                type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
                balance: '0',
            })
            return
        }

        if (chainId && currentProvider && currentAccount) {
            const balance = await web3.eth.getBalance(currentAccount)

            dispatchTradeStore({
                type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
                balance: inputToken?.type === EthereumTokenType.Native ? balance : '0',
            })

            dispatchTradeStore({
                type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
                balance:
                    isSameAddress(outputToken?.address, NATIVE_TOKEN_ADDRESS) ||
                    outputToken?.type === EthereumTokenType.Native
                        ? balance
                        : '0',
            })
        }
    }, [web3, inputToken, outputToken, currentAccount, currentProvider, chainId, currentChainId, NATIVE_TOKEN_ADDRESS])
}
