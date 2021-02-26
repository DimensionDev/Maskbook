import { DialogContent, createStyles, Typography, DialogProps } from '@material-ui/core'
import { InjectedDialog } from '../shared/InjectedDialog'
import { makeStyles } from '@material-ui/core/styles'
import { useStylesExtends } from '../custom-ui-helper'
import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { formatBalance } from '../../plugins/Wallet/formatter'
import BigNumber from 'bignumber.js'
import { ITO_Card } from '../../plugins/ITO/UI/ITO_Card'
import type { ERC20TokenDetailed } from '../../web3/types'
import { AirdropCard } from '../../plugins/Airdrop/UI/AirdropCard'
import { useState } from 'react'

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
            background: 'rgba(255, 255, 255, .2)',
        },
    }),
)

interface BreakdownDialogUIProps extends withClasses<never> {
    open: boolean
    token: ERC20TokenDetailed
    balance: string
    onUpdateBalance: () => void
    onClose?: () => void
    DialogProps?: Partial<DialogProps>
}

function BreakdownDialogUI(props: BreakdownDialogUIProps) {
    const { token, balance, onUpdateBalance } = props
    const classes = useStylesExtends(useStyles(), props)

    // the total amount to be claimed in wei
    const [airdropAmount, setAirdropAmount] = useState('0')
    const [ITO_Amount, setITO_Amount] = useState('0')

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
                    {formatBalance(new BigNumber(airdropAmount).plus(ITO_Amount).plus(balance), token.decimals, 2)}{' '}
                    {token.symbol}
                </Typography>
                <Typography className={classes.balance}>
                    <span>Balance:</span>
                    <span>
                        {formatBalance(new BigNumber(balance), 18, 2)} {token.symbol}
                    </span>
                </Typography>
                <AirdropCard token={token} onUpdateAmount={setAirdropAmount} onUpdateBalance={onUpdateBalance} />
                <ITO_Card token={token} onUpdateAmount={setITO_Amount} onUpdateBalance={onUpdateBalance} />
            </DialogContent>
        </InjectedDialog>
    )
}

export interface BreakdownDialogProps extends BreakdownDialogUIProps {}

export function BreakdownDialog(props: BreakdownDialogProps) {
    return <BreakdownDialogUI {...props} />
}
