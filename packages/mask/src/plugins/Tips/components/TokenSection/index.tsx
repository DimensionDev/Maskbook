import { useAccount, useFungibleTokenBalance, useGasPrice, useWeb3State } from '@masknet/plugin-infra/web3'
import { useGasConfig } from '@masknet/plugin-infra/web3-evm'
import { useSelectFungibleToken } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { FC, useCallback, useEffect, useMemo } from 'react'
import { TokenAmountPanel } from '../../../../web3/UI/TokenAmountPanel'
import { TargetRuntimeContext, useTip } from '../../contexts'

const GAS_LIMIT = 21000
export const TokenSection: FC = () => {
    const { token, setToken, amount, setAmount, isSending, setGasConfig } = useTip()
    const { targetChainId: chainId, pluginId } = TargetRuntimeContext.useContainer()
    const { Others } = useWeb3State<'all'>()

    const account = useAccount()

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useFungibleTokenBalance(
        pluginId,
        token?.address,
        { chainId, account },
    )
    const { gasPrice, gasConfig } = useGasConfig(chainId)
    const { value: defaultGasPrice = '1' } = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const isNativeToken = useMemo(() => isNativeTokenAddress(token?.address), [token?.address])

    const maxAmount = useMemo(() => {
        if (!isNativeToken) return tokenBalance
        const price = !gasPrice || gasPrice === '0' ? defaultGasPrice : gasPrice
        const gasFee = new BigNumber(price).times(GAS_LIMIT)
        return new BigNumber(tokenBalance).minus(gasFee).toFixed()
    }, [isNativeToken, tokenBalance, gasPrice, defaultGasPrice])

    useEffect(() => {
        if (isNativeToken) {
            setGasConfig(
                Others?.chainResolver.isSupport(chainId, '1559')
                    ? {
                          gas: GAS_LIMIT,
                          maxFeePerGas: gasConfig?.maxFeePerGas || defaultGasPrice,
                          maxPriorityFeePerGas: gasConfig?.maxPriorityFeePerGas || '1',
                      }
                    : {
                          gas: GAS_LIMIT,
                          gasPrice: gasPrice || defaultGasPrice,
                      },
            )
        } else {
            setGasConfig(undefined)
        }
    }, [isNativeToken, gasConfig, gasPrice, chainId])

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
    }, [selectFungibleToken, token?.address, pluginId, chainId])
    // #endregion
    return (
        <TokenAmountPanel
            label=""
            token={token}
            amount={amount}
            maxAmount={maxAmount}
            maxAmountSignificant={6}
            onAmountChange={setAmount}
            balance={tokenBalance}
            InputProps={{
                disabled: isSending,
            }}
            SelectTokenChip={{
                loading: loadingTokenBalance,
                ChipProps: {
                    onClick: onSelectTokenChipClick,
                },
            }}
        />
    )
}
