import { useState } from 'react'
import { DialogContent } from '@material-ui/core'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumERC20TokenApprovedBoundary } from '../../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'

export interface DrawDialogProps {
    open: boolean
    onClose: () => void
}

export function DrawDialog(props: DrawDialogProps) {
    const { open, onClose } = props

    const [count, setCount] = useState(0)

    return (
        <InjectedDialog open={open} onClose={onClose}>
            <DialogContent>
                <EthereumWalletConnectedBoundary>
                    <EthereumERC20TokenApprovedBoundary amount="0">
                        <ActionButton size="medium" fullWidth disabled>
                            Draw
                        </ActionButton>
                    </EthereumERC20TokenApprovedBoundary>
                </EthereumWalletConnectedBoundary>
            </DialogContent>
        </InjectedDialog>
    )
}
