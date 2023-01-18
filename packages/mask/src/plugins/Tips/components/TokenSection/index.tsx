import { FC, HTMLProps, useCallback, useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { useChainContext, useNetworkContext, useFungibleTokenBalance, useGasPrice } from '@masknet/web3-hooks-base'
import { useGasConfig } from '@masknet/web3-hooks-evm'
import { useSelectFungibleToken, FungibleTokenInput } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { useTip } from '../../contexts/index.js'
import { GasSettingsBar } from './GasSettingsBar.js'
import { TokenValue } from './TokenValue.js'

const useStyles = makeStyles()({
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
    tokenValue: {
        flexGrow: 1,
    },
})

interface Props extends HTMLProps<HTMLDivElement> {}

const ETH_GAS_LIMIT = 21000

export const TokenSection: FC<Props> = ({ className, ...rest }) => {
    const { classes, cx } = useStyles()
    const { token, setToken, amount, setAmount, recipientAddress } = useTip()
    const { pluginID } = useNetworkContext()
    const { chainId } = useChainContext()

    // balance
    const { value: tokenBalance = '0' } = useFungibleTokenBalance(pluginID, token?.address, {
        chainId,
        account: recipientAddress,
    })
    const { gasPrice } = useGasConfig(chainId)
    const { value: defaultGasPrice = '1' } = useGasPrice(pluginID, { chainId })
    const isNativeToken = useMemo(() => isNativeTokenAddress(token?.address), [token?.address])

    const maxAmount = useMemo(() => {
        if (!isNativeToken) return tokenBalance
        const price = !gasPrice || gasPrice === '0' ? defaultGasPrice : gasPrice
        const gasFee = new BigNumber(price).times(ETH_GAS_LIMIT)
        if (gasFee.gte(tokenBalance)) return '0'
        return new BigNumber(tokenBalance).minus(gasFee).toFixed()
    }, [isNativeToken, tokenBalance, gasPrice, defaultGasPrice])

    const selectFungibleToken = useSelectFungibleToken()
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await selectFungibleToken({
            pluginID,
            chainId,
            disableNativeToken: false,
            selectedTokens: token ? [token.address] : [],
        })
        if (picked) {
            setToken(picked)
        }
    }, [selectFungibleToken, token?.address, pluginID, chainId])
    // #endregion

    return (
        <div className={cx(className, classes.container)} {...rest}>
            <FungibleTokenInput
                label=""
                token={token}
                amount={amount}
                maxAmount={maxAmount}
                maxAmountSignificant={6}
                onAmountChange={setAmount}
                balance={tokenBalance}
                onSelectToken={onSelectTokenChipClick}
            />
            {pluginID === NetworkPluginID.PLUGIN_EVM ? <GasSettingsBar /> : null}
            <TokenValue className={classes.tokenValue} />
        </div>
    )
}
