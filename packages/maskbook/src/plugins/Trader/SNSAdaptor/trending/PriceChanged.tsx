import classNames from 'classnames'
import { useColorStyles } from '../../../../utils/theme'
import { makeStyles } from '@masknet/theme'
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'

const useStyles = makeStyles()({
    root: {
        fontSize: 'inherit',
        position: 'relative',
    },
    icon: {
        top: 0,
        bottom: 0,
        margin: 'auto',
        position: 'absolute',
        verticalAlign: 'middle',
    },
    value: {
        marginLeft: 20,
    },
})

export interface PriceChangedProps {
    amount: number
}

export function PriceChanged(props: PriceChangedProps) {
    const { classes: color } = useColorStyles()
    const { classes } = useStyles()
    if (props.amount === 0) return null
    return (
        <span className={classNames(classes.root, props.amount > 0 ? color.success : color.error)}>
            {props.amount > 0 ? <ArrowDropUpIcon className={classes.icon} /> : null}
            {props.amount < 0 ? <ArrowDropDownIcon className={classes.icon} /> : null}
            <span className={classes.value}>{props.amount.toFixed(2)}%</span>
        </span>
    )
}
