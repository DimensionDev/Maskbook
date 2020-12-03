import { makeStyles, createStyles } from '@material-ui/core'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { EthereumStatusBar } from '../../../../web3/UI/EthereumStatusBar'
import { Trader, TraderProps } from './Trader'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            maxWidth: 450,
            margin: '0 auto',
            padding: `0 ${theme.spacing(3)}px`,
            position: 'relative',
        },
        bar: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: theme.spacing(2),
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
    })
})

export interface TradeViewProps extends withClasses<'root'> {
    TraderProps: TraderProps
}

export function TradeView(props: TradeViewProps) {
    const { TraderProps } = props
    const classes = useStylesExtends(useStyles(), props)
    return (
        <div className={classes.root}>
            <div className={classes.bar}>
                <EthereumStatusBar />
            </div>
            <Trader {...TraderProps} />
        </div>
    )
}
