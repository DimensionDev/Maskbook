import { useRemoteControlledDialog, useSnackbarCallback } from '@masknet/shared'
import { DialogContent } from '@material-ui/core'
import { useRef } from 'react'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useI18N } from '../../../../utils'
import { WalletMessages, WalletRPC } from '../../messages'
import { ImportWalletUI, ImportWalletUIRef } from '@masknet/plugin-wallet/components'

export function ImportWalletDialog() {
    const { t } = useI18N()

    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.importWalletDialogUpdated)
    const { openDialog: openCreateImportDialog } = useRemoteControlledDialog(
        WalletMessages.events.createImportWalletDialogUpdated,
    )
    const ref = useRef<ImportWalletUIRef>(null)

    const backToPrevious = () => {
        closeDialog()
        ref.current?.reset()
        openCreateImportDialog()
    }

    const importByMnemonic = useSnackbarCallback(WalletRPC.importWalletByMnemonic, [], () => {
        closeDialog()
        ref.current?.reset()
    })
    const importByPrivateKey = useSnackbarCallback(WalletRPC.importWalletByPrivateKey, [], () => {
        closeDialog()
        ref.current?.reset()
    })

    return (
        <InjectedDialog open={open} onClose={closeDialog} title={t('import_wallet')} maxWidth="sm">
            <DialogContent>
                <ImportWalletUI
                    ref={ref}
                    onBack={backToPrevious}
                    isPrivateKeyValid={WalletRPC.isPrivateKeyValid}
                    onImportMnemonic={importByMnemonic}
                    onImportPrivateKey={importByPrivateKey}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
