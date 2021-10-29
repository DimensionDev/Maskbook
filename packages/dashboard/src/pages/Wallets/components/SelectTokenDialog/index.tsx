import { memo } from 'react'
import { MaskDialog } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { ERC20TokenList } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export interface SelectTokenDialogProps {
    open: boolean
    onClose: () => void
    onSelect?(token: FungibleTokenDetailed | null): void
}

// todo use remote dialog for add token list dialog
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
