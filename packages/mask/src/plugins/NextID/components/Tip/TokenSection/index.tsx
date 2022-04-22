import { usePickToken } from '@masknet/shared'
import {
    EthereumTokenType,
    isNativeTokenAddress,
    useFungibleTokenBalance,
    useGasPrice,
    isEIP1559Supported,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { FC, useCallback, useEffect, useMemo } from 'react'
import { TokenAmountPanel } from '../../../../../web3/UI/TokenAmountPanel'
import { useGasConfig } from '../../../../Trader/SNSAdaptor/trader/hooks/useGasConfig'
import { TargetChainIdContext, useTip } from '../../../contexts'

const GAS_LIMIT = 21000
export const TokenSection: FC = () => {
    const { token, setToken, amount, setAmount, isSending, setGasConfig } = useTip()
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useFungibleTokenBalance(
        token?.type || EthereumTokenType.Native,
        token?.address || '',
        chainId,
    )
    const { gasPrice, gasConfig } = useGasConfig(chainId)
    const { value: defaultGasPrice = '1' } = useGasPrice(chainId)
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
                isEIP1559Supported(chainId)
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

    const pickToken = usePickToken()
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await pickToken({
            chainId,
            disableNativeToken: false,
            selectedTokens: token ? [token.address] : [],
        })
        if (picked) {
            setToken(picked)
        }
    }, [pickToken, token?.address, chainId])
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
