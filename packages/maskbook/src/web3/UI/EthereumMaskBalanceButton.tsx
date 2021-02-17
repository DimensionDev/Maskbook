import { Button, createStyles, makeStyles } from '@material-ui/core'
import { useStylesExtends } from '../../components/custom-ui-helper'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            borderRadius: 16,
        },
    })
})

export interface EthereumMaskBalanceButtonProps extends withClasses<'root'> {}

export function EthereumMaskBalanceButton(props: EthereumMaskBalanceButtonProps) {
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Button className={classes.root} variant="contained" color="primary">
            0 MASK
        </Button>
    )
}
