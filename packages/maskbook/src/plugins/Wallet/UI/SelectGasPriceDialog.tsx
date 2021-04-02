import { useCallback } from 'react'
import {
    makeStyles,
    Typography,
    Button,
    Card,
    Theme,
    Box,
    CircularProgress,
    CircularProgressProps,
    DialogContent,
    DialogActions,
} from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../messages'
import type { GasPriceProvider } from '../types'

//#region gas price card
const useGasPriceCardStyles = makeStyles((theme) => ({
    root: {},
    indicator: {
        width: 10,
        height: 10,
        backgroundColor: theme.palette.text.primary,
        borderRadius: '50%',
        top: theme.spacing(1),
        right: theme.spacing(1),
        position: 'absolute',
    },
}))

export interface GasPriceCardProps {
    title: string
    price?: number
    estimatedSeconds?: number
    estimatedEther?: number
    estimatedDollar?: number
}

export function GasPriceCard(props: GasPriceCardProps) {
    const classes = useGasPriceCardStyles()

    return (
        <Card className={classes.root} variant="outlined">
            <div className={classes.indicator}></div>
            <Typography>{props.title}</Typography>
            <Box display="flex" flexDirection="column">
                <Typography color="textPrimary">30 sec</Typography>
                <Typography color="textSecondary">0.000643 ETH</Typography>
                <Typography color="textSecondary">$1.59</Typography>
            </Box>
        </Card>
    )
}
//#endregion

//#region select gas price dialog
const useSelectGasPriceDialogStyles = makeStyles((theme) => ({
    content: {},
}))

export interface SelectGasPriceDialogProps {
    provider: GasPriceProvider
}

export function SelectGasPriceDialog(props: SelectGasPriceDialogProps) {
    const classes = useSelectGasPriceDialogStyles()

    const [open, setOpen] = useRemoteControlledDialog(WalletMessages.events.selectWalletDialogUpdated)
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [setOpen])

    return (
        <InjectedDialog open={open} onClose={onClose} title="Selectx Gas Price" DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent className={classes.content}>
                <Box display="flex" justifyContent="space-between">
                    <GasPriceCard title="Standard" />
                    <GasPriceCard title="Fast" />
                    <GasPriceCard title="Custom" />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
                    Select the network fee you are willing to pay. The higher the fee, the better chances and faster
                    your transaction will go through.
                </Typography>
            </DialogContent>
        </InjectedDialog>
    )
}
//#endregion
