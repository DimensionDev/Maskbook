import { type FC, type HTMLProps, useCallback } from 'react'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { useSelectFungibleToken, FungibleTokenInput } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
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
    const { token, setToken, amount, setAmount, isAvailableBalance, balance } = useTip()
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()

    // balance

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
                isAvailableBalance={isAvailableBalance}
                onAmountChange={setAmount}
                balance={balance}
                onSelectToken={onSelectTokenChipClick}
            />
            {pluginID === NetworkPluginID.PLUGIN_EVM ? <GasSettingsBar /> : null}
            <TokenValue className={classes.tokenValue} />
        </div>
    )
}
