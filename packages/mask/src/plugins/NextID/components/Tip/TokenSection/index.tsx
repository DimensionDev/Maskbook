import { usePickToken } from '@masknet/shared'
import { EthereumTokenType, isNativeTokenAddress, useFungibleTokenBalance } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { FC, useCallback, useMemo } from 'react'
import { TokenAmountPanel } from '../../../../../web3/UI/TokenAmountPanel'
import { useGasConfig } from '../../../../Trader/SNSAdaptor/trader/hooks/useGasConfig'
import { TargetChainIdContext, useTip } from '../../../contexts'

const GAS_LIMIT = 21000
export const TokenSection: FC = () => {
    const { token, setToken, amount, setAmount, isSending } = useTip()
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useFungibleTokenBalance(
        token?.type || EthereumTokenType.Native,
        token?.address || '',
        chainId,
    )
    const gasConfig = useGasConfig(chainId)
    const maxAmount = useMemo(() => {
        if (!isNativeTokenAddress(token?.address)) return tokenBalance
        const gasPrice = gasConfig.gasPrice ?? '1'
        const gasFee = new BigNumber(gasPrice).times(GAS_LIMIT)
        return new BigNumber(tokenBalance).minus(gasFee).toFixed()
    }, [token?.address, tokenBalance, gasConfig.gasPrice])
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
