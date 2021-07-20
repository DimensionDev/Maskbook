import { makeStyles } from '@material-ui/core'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { Trader, TraderProps } from './Trader'

const useStyles = makeStyles((theme) => {
    return {
        root: {
            width: '100%',
            maxWidth: 450,
            margin: '0 auto',
            padding: theme.spacing(0, 3),
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
            <Trader {...TraderProps} />
        </div>
    )
}
