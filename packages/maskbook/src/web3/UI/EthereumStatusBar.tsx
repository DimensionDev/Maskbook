import { Box, makeStyles, Theme, ButtonProps, BoxProps } from '@material-ui/core'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { EthereumAccountButton } from './EthereumAccountButton'

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    chainChip: {
        margin: theme.spacing(0, 1),
    },
    accountChip: {},
}))

export interface EthereumStatusBarProps extends withClasses<never> {
    disableNativeToken?: boolean
    BoxProps?: Partial<BoxProps>
    AccountButtonProps?: Partial<ButtonProps>
}

export function EthereumStatusBar(props: EthereumStatusBarProps) {
    const { disableNativeToken = false, BoxProps, AccountButtonProps } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Box className={classes.root} {...BoxProps}>
            <EthereumAccountButton
                classes={{ root: classes.accountChip }}
                disableNativeToken={disableNativeToken}
                ButtonProps={props.AccountButtonProps}
            />
        </Box>
    )
}
