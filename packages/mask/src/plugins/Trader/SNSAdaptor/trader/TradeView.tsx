import { makeStyles } from '@masknet/theme'
import { useChainContext, useFungibleToken, useNetworkContext } from '@masknet/web3-hooks-base'
import { Trader, TraderProps } from './Trader.js'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'
import type { Web3Helper } from '@masknet/web3-helpers'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            paddingTop: theme.spacing(2),
            position: 'relative',
            boxSizing: 'border-box',
        },
        trade: {
            padding: `${theme.spacing(0, 2)}!important`,
            margin: '0 !important',
        },
    }
})

export interface TradeViewProps extends withClasses<'root'> {
    TraderProps: TraderProps
    expectedChainId?: Web3Helper.ChainIdAll
}

export function TradeView(props: TradeViewProps) {
    const { TraderProps } = props
    const { chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const { value: inputToken } = useFungibleToken(
        pluginID,
        TraderProps.defaultInputCoin?.address ?? '',
        TraderProps.defaultInputCoin,
        { chainId },
    )

    const { classes } = useStyles(undefined, { props })
    return (
        <div className={classes.root}>
            <AllProviderTradeContext.Provider initialState={{ chainId: props.expectedChainId }}>
                <Trader {...TraderProps} defaultInputCoin={inputToken} classes={{ root: classes.trade }} settings />
            </AllProviderTradeContext.Provider>
        </div>
    )
}
