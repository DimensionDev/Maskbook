import {
    Button,
    DialogContent,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    DialogActions,
} from '@material-ui/core'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../messages'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(4, 5, 1),
    },
    title: {
        fontSize: 18,
        fontWeight: 500,
        color: '#15181B',
        padding: theme.spacing(0, 1),
    },
    dialogActions: {
        alignItems: 'center',
        padding: theme.spacing(3, 5),
    },
    actionButton: {
        backgroundColor: '#1C68F3',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#1854c4',
        },
    },
    headCell: {
        borderBottom: 'none',
        backgroundColor: '#F3F3F4',
    },
    bodyCell: {
        borderBottom: 'none',
        padding: '0 10px',
    },
}))

const addressList = [
    {
        address: '0x7d37...D8f7',
        balance: '0',
    },
    {
        address: '0x7d38...D8f7',
        balance: '0',
    },
    {
        address: '0x7d39...D8f7',
        balance: '0',
    },
    {
        address: '0x7d3b...D8f7',
        balance: '0',
    },
    {
        address: '0x7d3a...D8f7',
        balance: '0',
    },
]

export interface ImportWalletDialogProps extends withClasses<never> {}

export function ImportWalletDialog(props: ImportWalletDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.importWalletDialogUpdated)

    return (
        <InjectedDialog
            open={open}
            onClose={closeDialog}
            title="Import Wallet"
            DialogProps={{
                maxWidth: 'sm',
            }}>
            <DialogContent className={classes.content}>
                <Typography variant="h1" className={classes.title}>
                    Derivation path (m'/ 44'/ 60'/ 0 /'0 )
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.headCell}>Address</TableCell>
                            <TableCell align="center" className={classes.headCell}>
                                Balances(ETH)
                            </TableCell>
                            <TableCell align="center" className={classes.headCell}>
                                Balances
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {addressList.map((address) => (
                            <TableRow key={address.address}>
                                <TableCell align="left" className={classes.bodyCell}>
                                    {address.address}
                                </TableCell>
                                <TableCell align="center" className={classes.bodyCell}>
                                    {address.balance}
                                </TableCell>
                                <TableCell align="center" className={classes.bodyCell}>
                                    <Button>Add</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
                <Button fullWidth className={classes.actionButton}>
                    Previous
                </Button>
                <Button fullWidth className={classes.actionButton}>
                    Next
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
