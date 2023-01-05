import { makeStyles } from '@masknet/theme'
import { useChainContext, useFungibleToken, useNetworkContext } from '@masknet/web3-hooks-base'
import { Trader, TraderProps } from './Trader.js'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'
import type { TrendingAPI } from '@masknet/web3-providers/types'

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
    trending?: TrendingAPI.Trending
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
            <AllProviderTradeContext.Provider>
                <Trader
                    {...TraderProps}
                    defaultInputCoin={inputToken}
                    chainId={chainId}
                    classes={{ root: classes.trade }}
                    settings
                    trending={props.trending}
                />
            </AllProviderTradeContext.Provider>
        </div>
    )
}
