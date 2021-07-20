import { useState } from 'react'
import { DialogContent, Typography } from '@material-ui/core'
import { InjectedDialog, InjectedDialogProps } from '../shared/InjectedDialog'
import { makeStyles } from '@material-ui/core/styles'
import { useStylesExtends } from '../custom-ui-helper'
import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { FormattedBalance } from '@masknet/shared'
import BigNumber from 'bignumber.js'
import { ITO_Card } from '../../plugins/ITO/SNSAdaptor/ITO_Card'
import type { ERC20TokenDetailed } from '@masknet/web3-shared'

const useStyles = makeStyles((theme) => ({
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
        background: 'rgba(255, 255, 255, .2)',
    },
}))

interface BreakdownDialogUIProps extends withClasses<never>, InjectedDialogProps {
    token: ERC20TokenDetailed
    balance: string
    onUpdateBalance: () => void
}

function BreakdownDialogUI(props: BreakdownDialogUIProps) {
    const { token, balance, onUpdateBalance } = props
    const classes = useStylesExtends(useStyles(), props)

    // the ito total amount to be claimed in wei
    const [amount, setAmount] = useState('0')

    return (
        <InjectedDialog
            open={props.open}
            onClose={props.onClose}
            title="Your Mask Breakdown"
            classes={{ dialogTitle: classes.dialogTitle, paper: classes.dialogPaper }}
            disableArrowBack>
            <DialogContent className={classes.content}>
                <MaskbookIcon classes={{ root: classes.logo }} />
                <Typography className={classes.amount}>
                    <FormattedBalance
                        value={new BigNumber(amount).plus(balance)}
                        decimals={token.decimals}
                        significant={2}
                        symbol={token.symbol}
                    />
                </Typography>
                <Typography className={classes.balance}>
                    <span>Balance:</span>
                    <span>
                        <FormattedBalance value={balance} decimals={18} significant={2} symbol={token.symbol} />
                    </span>
                </Typography>
                <ITO_Card token={token} onUpdateAmount={setAmount} onUpdateBalance={onUpdateBalance} />
            </DialogContent>
        </InjectedDialog>
    )
}

export interface BreakdownDialogProps extends BreakdownDialogUIProps {}

export function BreakdownDialog(props: BreakdownDialogProps) {
    return <BreakdownDialogUI {...props} />
}
