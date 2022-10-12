import { FC, HTMLProps, useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import {
    useAccount,
    useCurrentWeb3NetworkChainId,
    useCurrentWeb3NetworkPluginID,
    useFungibleTokenBalance,
    useGasPrice,
} from '@masknet/web3-hooks-base'
import { useGasConfig } from '@masknet/web3-hooks-evm'
import { useSelectFungibleToken, FungibleTokenInput } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { useTip } from '../../contexts/index.js'
import { GasSettingsBar } from './GasSettingsBar.js'
import { TokenValue } from './TokenValue.js'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
    tokenValue: {
        flexGrow: 1,
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {}

const ETH_GAS_LIMIT = 21000
export const TokenSection: FC<Props> = ({ className, ...rest }) => {
    const { classes, cx } = useStyles()
    const { token, setToken, amount, setAmount } = useTip()
    const chainId = useCurrentWeb3NetworkChainId()
    const pluginId = useCurrentWeb3NetworkPluginID()
    const account = useAccount()

    // balance
    const { value: tokenBalance = '0' } = useFungibleTokenBalance(pluginId, token?.address, {
        chainId,
        account,
    })
    const { gasPrice } = useGasConfig(chainId as ChainId)
    const { value: defaultGasPrice = '1' } = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId: chainId as ChainId })
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
            chainId,
            disableNativeToken: false,
            selectedTokens: token ? [token.address] : [],
        })
        if (picked) {
            setToken(picked)
        }
    }, [selectFungibleToken, token?.address, chainId])
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
            {pluginId === NetworkPluginID.PLUGIN_EVM ? <GasSettingsBar /> : null}
            <TokenValue className={classes.tokenValue} />
        </div>
    )
}
