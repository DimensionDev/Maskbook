import { ERC20TokenList, useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useI18N } from '../../../../utils'
import { DialogContent } from '@material-ui/core'
import { MaskDialog } from '@masknet/theme'
import { useState } from 'react'

export const RRC20TokenListDialog = () => {
    const { t } = useI18N()
    const [dialogProps, setDialogProps] = useState<any>()
    const { open, closeDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectERC20TokenDialogUpdated,
        (ev) => {
            if (ev.open) {
                setDialogProps(ev.props)
            }
        },
    )

    return (
        <MaskDialog maxWidth="md" title={t('add_token')} open={open} onClose={closeDialog}>
            <DialogContent>
                <ERC20TokenList {...dialogProps} />
            </DialogContent>
        </MaskDialog>
    )
}
