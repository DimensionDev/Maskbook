import { MaskDialog } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { memo, useState } from 'react'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { PLUGIN_IDENTIFIER } from '../constants'
import { useChainId } from '@masknet/web3-shared-evm'

interface SavingDialogProps {
    open: boolean
    onClose(): void
}

export const SavingDialog = memo<SavingDialogProps>(({ open, onClose }) => {
    const chainId = useChainId()
    const [currentChainTab, setCurrentChainTab] = useState(chainId)
    return (
        <MaskDialog open={open} title="Saving title" onClose={onClose} DialogProps={{}}>
            <DialogContent sx={{ minHeight: 200, minWidth: 400 }}>
                <NetworkTab setChainId={setCurrentChainTab} chainId={currentChainTab} pluginId={PLUGIN_IDENTIFIER} />
            </DialogContent>
        </MaskDialog>
    )
})
