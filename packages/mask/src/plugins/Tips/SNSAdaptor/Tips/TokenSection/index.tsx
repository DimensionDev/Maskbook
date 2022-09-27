import { FC, useCallback, useContext, useEffect, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import {
    useAccount,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useFungibleTokenBalance,
    useGasPrice,
    useWeb3State,
} from '@masknet/plugin-infra/web3'
import { useSelectFungibleToken, FungibleTokenInput } from '@masknet/shared'
import { TipsContext } from '../../Context/TipsContext.js'

const GAS_LIMIT = 21000

export const TokenSection: FC = () => {
    const { fungibleToken, setFungibleToken, amount, setAmount, transaction, loading } = useContext(TipsContext)

    const pluginID = useCurrentWeb3NetworkPluginID()
    const account = useAccount()
    const chainId = useChainId()
    const { Others } = useWeb3State()

    // balance
    const { value: tokenBalance = '0' } = useFungibleTokenBalance(pluginID, fungibleToken?.address, {
        chainId,
        account,
    })
    const { value: gasPrice = '0' } = useGasPrice(pluginID, { chainId })

    const isNativeToken = useMemo(
        () => Others?.isNativeTokenAddress(fungibleToken?.address),
        [fungibleToken?.address, Others],
    )

    const maxAmount = useMemo(() => {
        if (!isNativeToken) return tokenBalance
        const gasFee = new BigNumber(gasPrice).times(GAS_LIMIT)
        return new BigNumber(tokenBalance).minus(gasFee).toFixed()
    }, [isNativeToken, tokenBalance, gasPrice])

    useEffect(() => {
        transaction?.rest()
    }, [chainId])

    const selectFungibleToken = useSelectFungibleToken()
    const onSelectToken = useCallback(async () => {
        const picked = await selectFungibleToken({
            chainId,
            disableNativeToken: false,
            selectedTokens: fungibleToken ? [fungibleToken.address] : [],
        })
        if (picked) {
            setFungibleToken(picked)
        }
    }, [selectFungibleToken, fungibleToken?.address, pluginID, chainId])

    return (
        <FungibleTokenInput
            label=""
            token={fungibleToken}
            amount={amount}
            maxAmount={maxAmount}
            maxAmountSignificant={6}
            onAmountChange={setAmount}
            balance={tokenBalance}
            disabled={loading}
            onSelectToken={onSelectToken}
        />
    )
}
