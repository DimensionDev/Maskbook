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
    const [isGameShow, setGameShow] = useState(false)
    const [gameUrl, setGameUrl] = useState('')

    const { open, closeDialog } = useRemoteControlledDialog(PluginGameMessages.events.essayDialogUpdated, () => {})

    const handleGameClose = () => {
        setGameShow(false)
        setGameUrl('')
    }

    const handleGameOpen = (url: string) => {
        closeDialog()
        closeWalletDialog()
        setGameUrl(url)
        setGameShow(true)
    }

    const { closeDialog: closeWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )

    return (
        <>
            <InjectedDialog onClose={closeDialog} open={open} title="Game">
                <DialogContent>
                    <WalletStatusBox />
                    <GameList onPlay={handleGameOpen} />
                </DialogContent>
            </InjectedDialog>
            <GameWindow url={gameUrl} isShow={isGameShow} onClose={handleGameClose} />
        </>
    )
}

export default WalletConnectDialog
