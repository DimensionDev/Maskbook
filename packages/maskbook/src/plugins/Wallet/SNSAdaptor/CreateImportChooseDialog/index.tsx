import { DialogContent, makeStyles } from '@material-ui/core'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useI18N } from '../../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../../messages'
import { WalletWelcome_ImportOrCreate } from '@masknet/plugin-wallet/components'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(5, 4.5),
        display: 'block',
    },
}))

export function CreateImportChooseDialog() {
    const { t } = useI18N()
    const classes = useStyles()

    //#region remote controlled dialog logic
    const { openDialog: openCreateWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.createWalletDialogUpdated,
    )
    //#endregion

    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.createImportWalletDialogUpdated)
    const { openDialog: openImportDialog } = useRemoteControlledDialog(WalletMessages.events.importWalletDialogUpdated)

    const toCreateWallet = () => {
        openCreateWalletDialog()
        closeDialog()
    }

    const toImportWallet = () => {
        openImportDialog()
        closeDialog()
    }

    return (
        <InjectedDialog open={open} onClose={closeDialog} title={t('plugin_wallet_create_import_choose')} maxWidth="sm">
            <DialogContent className={classes.content}>
                <WalletWelcome_ImportOrCreate onCreateClick={toCreateWallet} onImportClick={toImportWallet} />
            </DialogContent>
        </InjectedDialog>
    )
}
