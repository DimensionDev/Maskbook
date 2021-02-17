import { Button, createStyles, makeStyles, Typography } from '@material-ui/core'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { MaskbookIcon } from '../../resources/MaskbookIcon'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            borderRadius: 16,
            fontWeight: 300,
            backgroundColor: '#1C68F3',
            '&:hover, &:active': {
                backgroundColor: '#1C68F3',
            },
        },
        icon: {
            border: `solid 1px ${theme.palette.common.white}`,
            borderRadius: '50%',
            marginRight: theme.spacing(0.5),
        },
    })
})

export interface EthereumMaskBalanceButtonProps extends withClasses<'root'> {}

export function EthereumMaskBalanceButton(props: EthereumMaskBalanceButtonProps) {
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Button className={classes.root} variant="contained" color="primary">
            <MaskbookIcon className={classes.icon} />
            <Typography>0 MASK</Typography>
        </Button>
    )
}
