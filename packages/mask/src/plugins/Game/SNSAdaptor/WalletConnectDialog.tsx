import { useState } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import DialogContent from '@mui/material/DialogContent'
import { PluginGameMessages } from '../messages'

import { InjectedDialog } from '@masknet/shared'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import GameList from './GameList'
import GameWindow from './GameWindow'

import { WalletMessages } from '../../Wallet/messages'

const WalletConnectDialog = () => {
    const { open, closeDialog } = useRemoteControlledDialog(PluginGameMessages.events.essayDialogUpdated, () => {})
    const handleClose = () => {
        closeDialog()
    }

    const [isGameShow, setGameShow] = useState(false)

    const handleGameClose = () => {
        setGameShow(false)
    }

    const handleGameOpen = () => {
        closeDialog()
        closeWalletDialog()
        setGameShow(true)
    }

    const { closeDialog: closeWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )

    return (
        <>
            <InjectedDialog onClose={handleClose} open={open} title="Game">
                <DialogContent>
                    <WalletStatusBox />
                    <GameList onPlay={handleGameOpen} />
                </DialogContent>
            </InjectedDialog>
            <GameWindow isShow={isGameShow} onClose={handleGameClose} />
        </>
    )
}

export default WalletConnectDialog
