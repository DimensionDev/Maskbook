import React from 'react'
import { TextField, makeStyles, createStyles, Typography, Divider, Chip, Box } from '@material-ui/core'
import ArrowBack from '@material-ui/icons/ArrowBack'
import ActionButton from '../DashboardComponents/ActionButton'
import { DialogContentItem } from './DialogBase'
import { RedPacket } from '../DashboardComponents/RedPacket2'
import WalletLine from '../DashboardComponents/WalletLine'

interface WalletSendRedPacketDialogProps {
    onDecline(): void
}

const useSendRedPacketStyles = makeStyles(theme =>
    createStyles({
        body: {
            padding: theme.spacing(1, 0),
        },
        provider: {
            padding: theme.spacing(0.3, 0),
        },
    }),
)

export function WalletSendRedPacketDialog(props: WalletSendRedPacketDialogProps) {
    const { onDecline } = props
    const classes = useSendRedPacketStyles()
    return (
        <DialogContentItem
            onExit={onDecline}
            title="Send Red Packet"
            content={
                <>
                    <Typography className={classes.body}>
                        You may create a Red Packet when creating a Post. Simply select "Red Packet" in the "Plugins
                        (Experimental)" section.
                    </Typography>
                    <Typography color="primary" className={classes.provider}>
                        Open facebook.com
                    </Typography>
                    <Typography color="primary" className={classes.provider}>
                        Open twitter.com
                    </Typography>
                </>
            }></DialogContentItem>
    )
}

interface WalletAddTokenDialogProps {
    onConfirm(token: string): void
    onDecline(): void
}

const useAddTokenStyles = makeStyles(theme =>
    createStyles({
        textfield: {
            width: '100%',
            padding: theme.spacing(1, 0),
        },
    }),
)

export function WalletAddTokenDialog(props: WalletAddTokenDialogProps) {
    const { onConfirm, onDecline } = props
    const [token, setToken] = React.useState('')
    const classes = useAddTokenStyles()
    return (
        <DialogContentItem
            onExit={onDecline}
            title={'Add Token'}
            content={
                <TextField
                    className={classes.textfield}
                    label="Token Contract"
                    value={token}
                    onChange={e => setToken(e.target.value)}></TextField>
            }
            actions={
                <ActionButton variant="contained" color="primary" onClick={() => onConfirm(token)}>
                    Add Token
                </ActionButton>
            }></DialogContentItem>
    )
}

interface WalletRedPacketHistoryDialogProps {
    onClick?(): void
    onDecline(): void
}

export function WalletRedPacketHistoryDialog(props: WalletRedPacketHistoryDialogProps) {
    const { onClick, onDecline } = props

    return (
        <DialogContentItem
            onExit={onDecline}
            title="Red Packets History"
            content={
                <>
                    <WalletLine
                        line1='"Best Wishes!"'
                        line2="2 hr ago from CMK"
                        onClick={onClick}
                        invert
                        action={<Typography variant="h6">5.3 USDT</Typography>}
                    />
                    <WalletLine
                        line1='"Hallo Welt!"'
                        line2="20 hr ago from CMK"
                        onClick={onClick}
                        invert
                        action={<Typography variant="h6">0.12 ETH</Typography>}
                    />
                    <WalletLine
                        line1='"RAmen!"'
                        line2="200 hr ago from CMK"
                        onClick={onClick}
                        invert
                        action={<Typography variant="h6">12 USDT</Typography>}
                    />
                </>
            }></DialogContentItem>
    )
}

const useRedPacketDetailStyles = makeStyles(theme =>
    createStyles({
        openBy: {
            margin: theme.spacing(2, 0, 0.5),
        },
    }),
)

interface WalletRedPacketDetailDialogProps {
    onDecline(): void
}

export function WalletRedPacketDetailDialog(props: WalletRedPacketHistoryDialogProps) {
    const { onDecline } = props
    const classes = useRedPacketDetailStyles()
    return (
        <DialogContentItem
            icon={<ArrowBack />}
            onExit={onDecline}
            title="Red Packet Detail"
            content={
                <>
                    <RedPacket />
                    <WalletLine
                        line1="Source"
                        line2={<Typography color="primary">twitter.com/status/668163...</Typography>}
                    />
                    <WalletLine
                        line1="From"
                        line2={
                            <>
                                CMK <Chip label="Me" variant="outlined" color="secondary" size="small"></Chip>
                            </>
                        }
                    />
                    <WalletLine line1="Message" line2="Best Wishes!" />
                    <Typography className={classes.openBy} variant="subtitle1">
                        Opened By
                    </Typography>
                    <Divider />
                    <WalletLine
                        line1="Neruthes"
                        line2="0x1191467182361282137761"
                        invert
                        action={<Typography variant="h6">5.28714</Typography>}
                    />
                    <WalletLine
                        line1="CCCP"
                        line2="0x1191467182361282137744"
                        invert
                        action={<Typography variant="h6">5.28714</Typography>}
                    />
                    <Box p={1} display="flex" justifyContent="center">
                        <Typography variant="caption" color="textSecondary">
                            2 hr ago created, 2 hr ago received.
                        </Typography>
                    </Box>
                </>
            }></DialogContentItem>
    )
}
