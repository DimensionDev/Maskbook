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
        setGameId(0)
    }

    const handleGameOpen = (id: number) => {
        closeDialog()
        closeWalletDialog()
        setGameId(id)
        setGameShow(true)
    }

    const { closeDialog: closeWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )

    const [gameId, setGameId] = useState(0)
    return (
        <>
            <InjectedDialog onClose={handleClose} open={open} title="Game">
                <DialogContent>
                    <WalletStatusBox />
                    <GameList onPlay={handleGameOpen} />
                </DialogContent>
            </InjectedDialog>
            <GameWindow id={gameId} isShow={isGameShow} onClose={handleGameClose} />
        </>
    )
}

export default WalletConnectDialog
