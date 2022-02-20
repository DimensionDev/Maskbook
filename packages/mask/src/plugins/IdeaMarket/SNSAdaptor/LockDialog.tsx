import { useRemoteControlledDialog } from '@masknet/shared'
import { useTransactionState } from '@masknet/web3-shared-evm'
import { Button, DialogContent, Divider, Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { WalletMessages } from '../../Wallet/messages'

interface LockDialogProps {
    open: boolean
    onClose: () => void
}

export function LockDialog(props: LockDialogProps) {
    const { open, onClose } = props
    const { setDialog: setLockDialogOpen } = useRemoteControlledDialog(WalletMessages.events.transactionDialogUpdated)
    const [period, setPeriod] = useState('1')
    const [depositState, setDepositState] = useTransactionState()
    // const { value, error, loading } = useLockCallback()
    const title = 'Lock Period'
    // console.log(value, error)

    useEffect(() => {
        // setLockDialogOpen({
        //     open: true,
        //     state: depositState,
        // })
    })

    return (
        <InjectedDialog open={props.open} onClose={() => onClose()} title={title}>
            <DialogContent>
                <Grid container direction="column" alignItems="center" rowSpacing={2}>
                    <Grid item>
                        <Typography variant="h6">Why should I lock tokens?</Typography>
                        <Typography variant="body1">
                            Locking tokens signals your confidence in a listing. For a limited time, locked tokens will
                            be rewarded with $IMO, Ideamarket&#x2019;s native token.
                        </Typography>
                    </Grid>
                    <Divider />
                    <Grid item>
                        <ToggleButtonGroup
                            color="primary"
                            value={period}
                            exclusive
                            onChange={(e, newPeriod) => setPeriod(newPeriod)}>
                            <ToggleButton value="1">1 month (30 days)</ToggleButton>
                            <ToggleButton value="3">3 months (90 days)</ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                    <Grid container item>
                        <Button fullWidth>Lock now</Button>
                    </Grid>
                </Grid>
            </DialogContent>
        </InjectedDialog>
    )
}
