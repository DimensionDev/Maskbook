import { Box, makeStyles, createStyles, Theme, ChipProps, BoxProps } from '@material-ui/core'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { EthereumAccountButton } from './EthereumAccountButton'
import { EthereumGasButton } from './EthereumGasButton'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            '& > * ': {
                marginRight: theme.spacing(1),
            },
            '& > * : last-child': {
                marginRight: 0,
            },
        },
        chainChip: {
            margin: theme.spacing(0, 1),
        },
        accountChip: {},
    }),
)

export interface EthereumStatusBarProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    BoxProps?: Partial<BoxProps>
    AccountButtonProps?: Partial<ChipProps>
}

export function EthereumStatusBar(props: EthereumStatusBarProps) {
    const { BoxProps, AccountButtonProps } = props
    const classes = useStylesExtends(useStyles(), props)
    return (
        <Box className={classes.root} {...BoxProps}>
            <EthereumGasButton classes={{ root: classes.accountChip }} />
            <EthereumAccountButton classes={{ root: classes.accountChip }} {...AccountButtonProps} />
        </Box>
    )
}
