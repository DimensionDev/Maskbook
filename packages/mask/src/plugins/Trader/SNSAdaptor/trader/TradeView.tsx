import { makeStyles } from '@masknet/theme'
import { useChainContext, useFungibleToken, useNetworkContext } from '@masknet/web3-hooks-base'
import { Trader, type TraderProps } from './Trader.js'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext.js'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'

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
    const { chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const { data: inputToken } = useFungibleToken(
        pluginID,
        TraderProps.defaultInputCoin?.address ?? '',
        TraderProps.defaultInputCoin,
        { chainId },
    )

    const { data: outputToken } = useFungibleToken(
        pluginID,
        TraderProps.defaultOutputCoin?.address ?? '',
        TraderProps.defaultOutputCoin,
        { chainId: TraderProps.defaultOutputCoin?.chainId ?? chainId },
    )

    const { classes } = useStyles(undefined, { props })
    return (
        <div className={classes.root}>
            <AllProviderTradeContext.Provider>
                <Trader
                    {...TraderProps}
                    defaultOutputCoin={isNativeTokenAddress(outputToken?.address) ? undefined : outputToken}
                    defaultInputCoin={inputToken}
                    chainId={chainId}
                    classes={{ root: classes.trade }}
                    settings
                />
            </AllProviderTradeContext.Provider>
        </div>
    )
}
