import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useChainContext, useFungibleToken } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { Trader, TraderProps } from './Trader.js'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'

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
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: inputToken } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        TraderProps.defaultInputCoin?.address ?? '',
        TraderProps.defaultInputCoin,
        { chainId },
    )
    const classes = useStylesExtends(useStyles(), props)
    return (
        <div className={classes.root}>
            <AllProviderTradeContext.Provider>
                <Trader
                    {...TraderProps}
                    defaultInputCoin={inputToken as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>}
                    chainId={chainId}
                    classes={{ root: classes.trade }}
                    settings
                />
            </AllProviderTradeContext.Provider>
        </div>
    )
}
