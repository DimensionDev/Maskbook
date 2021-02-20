import { DialogContent, Button, createStyles, Typography, Box, Alert, DialogProps } from '@material-ui/core'
import { InjectedDialog } from '../shared/InjectedDialog'
import { makeStyles } from '@material-ui/core/styles'
import { useStylesExtends } from '../custom-ui-helper'
import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { useERC20TokenBalance } from '../../web3/hooks/useERC20TokenBalance'
import { useConstant } from '../../web3/hooks/useConstant'
import { CONSTANTS } from '../../web3/constants'
import { formatBalance } from '../../plugins/Wallet/formatter'
import BigNumber from 'bignumber.js'
import { AirdropCard } from '../../plugins/Airdrop/UI/AirdropCard'
import { ITO_Card } from '../../plugins/ITO/UI/ITO_Card'

const useStyles = makeStyles((theme) =>
    createStyles({
        dialogPaper: {
            background: 'linear-gradient(180.43deg, #04277B 26.69%, #6B94F2 99.57%)',
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: theme.spacing(2, 4.375, 4),
            color: '#fff',
        },
        dialogTitle: {
            backgroundColor: '#04277B',
            color: '#fff',
            borderBottom: 'none !important',
        },
        logo: {
            width: 96,
            height: 96,
        },
        amount: {
            fontSize: 32,
            marginTop: theme.spacing(5),
        },
        balance: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14,
            width: '100%',
            margin: theme.spacing(3.75, 0, 2.5),
        },
        checkAddress: {
            padding: theme.spacing(2.5),
            fontSize: 13,
            color: '#fff',
        },
        button: {
            background: 'rgba(255,255,255,.2)',
            //TODO: https://github.com/mui-org/material-ui/issues/25011
            '&[disabled]': {
                opacity: 0.5,
            },
        },
    }),
)

interface BreakdownDialogUIProps extends withClasses<never> {
    open: boolean
    onClose?: () => void
    DialogProps?: Partial<DialogProps>
}

function BreakdownDialogUI(props: BreakdownDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)

    const MASK_ADDRESS = useConstant(CONSTANTS, 'MASK_ADDRESS')
    const { value: maskBalance = '0', error: maskBalanceError, loading: maskBalanceLoading } = useERC20TokenBalance(
        MASK_ADDRESS,
    )

    return (
        <InjectedDialog
            open={props.open}
            onClose={props.onClose}
            title="Your Mask Breakdown"
            classes={{ dialogTitle: classes.dialogTitle, paper: classes.dialogPaper }}>
            <DialogContent className={classes.content}>
                <MaskbookIcon classes={{ root: classes.logo }} />
                <Typography className={classes.amount}>200.00 MASK</Typography>
                <Typography className={classes.balance}>
                    <span>Balance:</span>
                    <span>{formatBalance(new BigNumber(maskBalance), 18, 6)} MASK</span>
                </Typography>
                <AirdropCard />
                <ITO_Card />
            </DialogContent>
        </InjectedDialog>
    )
}

export interface BreakdownDialogProps extends BreakdownDialogUIProps {}

export function BreakdownDialog(props: BreakdownDialogProps) {
    return <BreakdownDialogUI {...props} />
}
