import { useState } from 'react'
import { ERC20TokenList, useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '@masknet/plugin-wallet'
import { DialogContent } from '@mui/material'
import { MaskDialog } from '@masknet/theme'
import { useI18N } from '../../../../utils'

export const ERC20TokenListDialog = () => {
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
