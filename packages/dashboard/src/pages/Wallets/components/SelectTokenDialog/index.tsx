import { memo } from 'react'
import { MaskDialog } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { ERC20TokenList } from '@masknet/shared'
import { DialogContent } from '@material-ui/core'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'

export interface SelectTokenDialogProps {
    open: boolean
    onClose: () => void
    onSelect?(token: FungibleTokenDetailed | null): void
}

export const SelectTokenDialog = memo<SelectTokenDialogProps>(({ open, onClose, onSelect }) => {
    const t = useDashboardI18N()

    return (
        <MaskDialog maxWidth="md" open={open} title={t.wallets_add_token()} onClose={onClose}>
            <DialogContent>
                <ERC20TokenList onSelect={onSelect} />
            </DialogContent>
        </MaskDialog>
    )
})
