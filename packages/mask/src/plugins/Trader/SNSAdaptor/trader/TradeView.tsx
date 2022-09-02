import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Trader, TraderProps } from './Trader'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

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
}

export function TradeView(props: TradeViewProps) {
    const { TraderProps } = props
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const classes = useStylesExtends(useStyles(), props)
    return (
        <div className={classes.root}>
            <AllProviderTradeContext.Provider>
                <Trader {...TraderProps} chainId={chainId} classes={{ root: classes.trade }} settings />
            </AllProviderTradeContext.Provider>
        </div>
    )
}
