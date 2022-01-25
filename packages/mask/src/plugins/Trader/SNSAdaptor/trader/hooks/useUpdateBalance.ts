import type { ChainId } from '@masknet/web3-shared-evm'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../../trader/useAllProviderTradeContext'
import {
    EthereumTokenType,
    isSameAddress,
    useAccount,
    useProviderType,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import { currentBalancesSettings } from '../../../../Wallet/settings'
import Services from '../../../../../extension/service'
import { WalletRPC } from '../../../../Wallet/messages'

export function useUpdateBalance(chainId: ChainId, currentChainId: ChainId) {
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
            const cacheBalance = currentBalancesSettings.value[currentProvider]?.[chainId]

            let balance: string

            if (cacheBalance) balance = cacheBalance
            else {
                balance = await Services.Ethereum.getBalance(currentAccount, {
                    chainId: chainId,
                    providerType: currentProvider,
                })
                await WalletRPC.updateBalances({
                    [currentProvider]: {
                        [chainId]: balance,
                    },
                })
            }

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
    }, [inputToken, outputToken, currentAccount, currentProvider, chainId, currentChainId, NATIVE_TOKEN_ADDRESS])
}
