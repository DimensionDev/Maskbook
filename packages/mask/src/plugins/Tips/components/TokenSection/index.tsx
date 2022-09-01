import { FC, useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import {
    useAccount,
    useFungibleTokenBalance,
    useGasPrice,
    useNativeTokenPrice,
    useWeb3State,
} from '@masknet/plugin-infra/web3'
import { useGasConfig } from '@masknet/plugin-infra/web3-evm'
import { useSelectFungibleToken, FungibleTokenInput, SelectGasSettingsToolbar } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import {
    createNativeToken,
    EIP1559GasConfig,
    isNativeTokenAddress,
    PriorEIP1559GasConfig,
    Transaction,
} from '@masknet/web3-shared-evm'
import { TargetRuntimeContext, useTip } from '../../contexts/index.js'

const GAS_LIMIT = 21000
export const TokenSection: FC = () => {
    const { token, setToken, amount, setAmount, isSending, setGasConfig, gasConfig } = useTip()
    const { targetChainId: chainId, pluginId } = TargetRuntimeContext.useContainer()
    const { Others } = useWeb3State<'all'>()

    const account = useAccount()
    const nativeToken = useMemo(() => createNativeToken(chainId), [chainId])

    // balance
    const { value: tokenBalance = '0' } = useFungibleTokenBalance(pluginId, token?.address, {
        chainId,
        account,
    })
    const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })
    const { gasPrice } = useGasConfig(chainId)
    const { value: defaultGasPrice = '1' } = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const isNativeToken = useMemo(() => isNativeTokenAddress(token?.address), [token?.address])

    const maxAmount = useMemo(() => {
        if (!isNativeToken) return tokenBalance
        const price = !gasPrice || gasPrice === '0' ? defaultGasPrice : gasPrice
        const gasFee = new BigNumber(price).times(GAS_LIMIT)
        if (gasFee.lte(gasFee)) return '0'
        return new BigNumber(tokenBalance).minus(gasFee).toFixed()
    }, [isNativeToken, tokenBalance, gasPrice, defaultGasPrice])

    // useEffect(() => {
    //     if (isNativeToken) {
    //         setGasConfig(
    //             Others?.chainResolver.isSupport(chainId, 'EIP1559')
    //                 ? {
    //                       gas: GAS_LIMIT,
    //                       maxFeePerGas: gasConfig?.maxFeePerGas || defaultGasPrice,
    //                       maxPriorityFeePerGas: gasConfig?.maxPriorityFeePerGas || '1',
    //                   }
    //                 : {
    //                       gas: GAS_LIMIT,
    //                       gasPrice: gasPrice || defaultGasPrice,
    //                   },
    //         )
    //     } else {
    //         setGasConfig(undefined)
    //     }
    // }, [isNativeToken, gasConfig, gasPrice, chainId])

    const selectFungibleToken = useSelectFungibleToken()
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await selectFungibleToken({
            chainId,
            disableNativeToken: false,
            selectedTokens: token ? [token.address] : [],
        })
        if (picked) {
            setToken(picked)
        }
    }, [selectFungibleToken, token?.address, chainId])

    const handleGasSettingChange = useCallback(
        (tx: Transaction) => {
            setGasConfig(
                Others?.chainResolver.isSupport(chainId, 'EIP1559')
                    ? {
                          gas: GAS_LIMIT,
                          maxFeePerGas:
                              (tx.maxFeePerGas as string) ||
                              (gasConfig as EIP1559GasConfig)?.maxFeePerGas ||
                              defaultGasPrice,
                          maxPriorityFeePerGas:
                              (tx.maxPriorityFeePerGas as string) ||
                              (gasConfig as EIP1559GasConfig)?.maxPriorityFeePerGas ||
                              '1',
                      }
                    : {
                          gas: GAS_LIMIT,
                          gasPrice:
                              (tx.gasPrice as string) ||
                              (gasConfig as PriorEIP1559GasConfig)?.gasPrice ||
                              defaultGasPrice,
                      },
            )
        },
        [Others?.chainResolver.isSupport, defaultGasPrice],
    )
    // #endregion
    return (
        <div>
            <FungibleTokenInput
                label=""
                token={token}
                amount={amount}
                maxAmount={maxAmount}
                maxAmountSignificant={6}
                onAmountChange={setAmount}
                balance={tokenBalance}
                disabled={isSending}
                onSelectToken={onSelectTokenChipClick}
            />
            <SelectGasSettingsToolbar
                nativeToken={nativeToken}
                nativeTokenPrice={nativeTokenPrice}
                transaction={gasConfig}
                onChange={handleGasSettingChange}
            />
        </div>
    )
}
