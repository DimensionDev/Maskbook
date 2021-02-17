import { Button, createStyles, makeStyles } from '@material-ui/core'
import { useStylesExtends } from '../../components/custom-ui-helper'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {},
    })
})

export interface EthereumEtherBalanceButtonProps extends withClasses<'root'> {}

export function EthereumEtherBalanceButton(props: EthereumEtherBalanceButtonProps) {
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Button className={classes.root} variant="outlined">
            0.53434 ETH
        </Button>
    )
}
