import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import { Trader, TraderProps } from './Trade'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            maxWidth: 450,
            margin: '0 auto',
            padding: theme.spacing(2.5, 3),
            position: 'relative',
            boxSizing: 'border-box',
        },
        actions: {},
        settings: {
            zIndex: 1,
            top: 0,
            right: theme.spacing(3),
            bottom: 0,
            left: theme.spacing(3),
            position: 'absolute',
        },
    }
})

export interface TradeViewProps extends withClasses<'root'> {
    TraderProps: TraderProps
}

export function TradeView(props: TradeViewProps) {
    const { TraderProps } = props
    const classes = useStylesExtends(useStyles(), props)
    return (
        <div className={classes.root}>
            <AllProviderTradeContext.Provider>
                <Trader {...TraderProps} />
            </AllProviderTradeContext.Provider>
        </div>
    )
}
