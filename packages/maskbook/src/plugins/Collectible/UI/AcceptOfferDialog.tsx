import { FC, useCallback } from 'react'
import {
    DialogContent,
    DialogActions,
    Link,
    createStyles,
    makeStyles,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
} from '@material-ui/core'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { Image } from '../../../components/shared/Image'
import { PluginCollectibleMessage } from '../messages'

const useStyles = makeStyles((theme) =>
    createStyles({
        itemInfo: {
            display: 'flex',
            alignItems: 'center',
        },
        texts: {
            marginLeft: theme.spacing(1),
        },
    }),
)

interface AcceptOfferDialogProps {
    onAccept?: () => void
}

export function useControlledAcceptOfferDialog() {
    const [open, setOpen] = useRemoteControlledDialog(PluginCollectibleMessage.events.acceptOfferDialogEvent)
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [])
    const onOpen = useCallback(() => {
        setOpen({
            open: true,
        })
    }, [])
    return {
        open,
        onClose,
        onOpen,
    }
}

export const AcceptOfferDialog: FC<AcceptOfferDialogProps> = ({ onAccept }) => {
    const classes = useStyles()
    const { open, onClose } = useControlledAcceptOfferDialog()

    return (
        <InjectedDialog open={open} onClose={onClose} title="Accept Offer">
            <DialogContent>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <div className={classes.itemInfo}>
                                    <Image height={110} width={80} src="https://dummyimage.com/160x220/ffffff/000000" />
                                    <div className={classes.texts}>
                                        <Link>US 2020 Election NFT V2</Link>
                                        <Typography>US 2020 Election NFT V2</Typography>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell align="right">
                                <Typography>1.0501</Typography>
                                <Typography variant="caption">($221.86)</Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Typography>OpenSea Fee</Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography>25%</Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Typography>Total Received</Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography>1.0239</Typography>
                                <Typography variant="caption">($216.31)</Typography>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <ActionButton fullWidth variant="contained" size="large" onClick={onAccept}>
                    Accept
                </ActionButton>
            </DialogActions>
        </InjectedDialog>
    )
}
