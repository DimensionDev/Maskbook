import { ButtonProps, createStyles, makeStyles, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useStylesExtends } from '../../components/custom-ui-helper'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { formatBalance } from '../../plugins/Wallet/formatter'
import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { CONSTANTS } from '../constants'
import { useConstant } from '../hooks/useConstant'
import { useERC20TokenBalance } from '../hooks/useERC20TokenBalance'

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
            border: `solid 2px ${theme.palette.common.white}`,
            borderRadius: '50%',
            marginRight: theme.spacing(0.5),
        },
    })
})

export interface EthereumMaskBalanceButtonProps extends withClasses<'root'> {
    ButtonProps?: Partial<ButtonProps>
}

export function EthereumMaskBalanceButton(props: EthereumMaskBalanceButtonProps) {
    const classes = useStylesExtends(useStyles(), props)

    const MASK_ADDRESS = useConstant(CONSTANTS, 'MASK_ADDRESS')
    const { value: maskBalance = '0', error: maskBalanceError, loading: maskBalanceLoading } = useERC20TokenBalance(
        MASK_ADDRESS,
    )

    return (
        <ActionButton
            className={classes.root}
            variant="contained"
            color="primary"
            loading={maskBalanceLoading}
            {...props.ButtonProps}>
            {process.env.architecture === 'web' && !maskBalanceLoading ? (
                <MaskbookIcon className={classes.icon} />
            ) : null}
            <Typography>{formatBalance(new BigNumber(maskBalance), 18, 6)} MASK</Typography>
        </ActionButton>
    )
}
