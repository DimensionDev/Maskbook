import { type HTMLProps, useCallback } from 'react'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { FungibleTokenInput, SelectFungibleTokenModal, TokenValue } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useTip } from '../../contexts/index.js'
import { GasSettingsBar } from './GasSettingsBar.js'
import { TargetRuntimeContext } from '../../contexts/TargetRuntimeContext.js'

const useStyles = makeStyles()({
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
    tokenValue: {
        flexGrow: 1,
    },
})

export function TokenSection(props: HTMLProps<HTMLDivElement>) {
    const { classes, cx } = useStyles()
    const { token, setToken, amount, setAmount, isAvailableBalance, balance } = useTip()
    const { pluginID } = useNetworkContext()
    const { chainId } = useChainContext()
    const { setTargetChainId } = TargetRuntimeContext.useContainer()

    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await SelectFungibleTokenModal.openAndWaitForClose({
            pluginID,
            chainId,
            disableNativeToken: false,
            selectedTokens: token ? [token] : [],
        })
        if (!picked || Array.isArray(picked)) return
        if (chainId !== picked.chainId) {
            setTargetChainId(picked.chainId)
        }
        setToken(picked)
    }, [token?.address, pluginID, chainId, setTargetChainId])

    return (
        <div {...props} className={cx(props.className, classes.container)}>
            <FungibleTokenInput
                label=""
                token={token}
                amount={amount}
                isAvailableBalance={isAvailableBalance}
                onAmountChange={setAmount}
                balance={balance}
                onSelectToken={onSelectTokenChipClick}
            />
            {pluginID === NetworkPluginID.PLUGIN_EVM ?
                <GasSettingsBar />
            :   null}
            <TokenValue className={classes.tokenValue} token={token} amount={amount} />
        </div>
    )
}
