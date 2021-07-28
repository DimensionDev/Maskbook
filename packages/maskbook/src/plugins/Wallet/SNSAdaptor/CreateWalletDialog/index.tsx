import { useCallback } from 'react'
import { DialogContent, makeStyles } from '@material-ui/core'
import { useI18N } from '../../../../utils'
import { useRemoteControlledDialog, delay } from '@masknet/shared'
import { WalletMessages, WalletRPC } from '../../messages'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { CreateWalletUI } from '@masknet/plugin-wallet/components'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(5, 4.5),
    },
    top: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(2, 0, 1),
    },
    bottom: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(4, 0, 0),
    },
    description: {},
    input: {
        width: '100%',
    },
    card: {
        position: 'relative',
        minHeight: 140,
        display: 'flex',
        flexFlow: 'row wrap',
        alignContent: 'flex-start',
        justifyContent: 'space-evenly',
    },
    cardButton: {
        padding: theme.spacing(1, 2, 3),
        backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.grey[50],
    },
    cardTextfield: {
        justifyContent: 'space-between',
    },
    word: {
        width: 101,
        minWidth: 101,
        whiteSpace: 'nowrap',
        marginTop: theme.spacing(2),
    },
    wordButton: {
        backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.common.white,
    },
    wordTextfield: {
        width: 110,
    },
    confirmation: {
        fontSize: 12,
        lineHeight: 1.75,
    },
    warning: {
        marginTop: theme.spacing(2),
    },
}))

export function CreateWalletDialog() {
    const { t } = useI18N()
    const classes = useStyles()

    //#region remote controlled dialog logic
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.createWalletDialogUpdated)
    const onClose = useCallback(async () => {
        closeDialog()
        await delay(300)
    }, [])
    //#endregion

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_setup_title_create')} maxWidth="sm">
            <DialogContent className={classes.content}>
                <CreateWalletUI onCreated={onClose} createNewWallet={WalletRPC.importNewWalletDashboard} />
            </DialogContent>
        </InjectedDialog>
    )
}
