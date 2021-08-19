import { memo } from 'react'
import { MaskDialog } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { ERC20TokenList } from '@masknet/shared'
import { DialogContent } from '@material-ui/core'

export interface AddTokenDialogProps {
    open: boolean
    onClose: () => void
}

export const AddTokenDialog = memo<AddTokenDialogProps>(({ open, onClose }) => {
    const t = useDashboardI18N()

    return (
        <MaskDialog maxWidth="md" open={open} title={t.wallets_add_token()} onClose={onClose}>
            <DialogContent>
                <ERC20TokenList />
            </DialogContent>
        </MaskDialog>
    )
})
