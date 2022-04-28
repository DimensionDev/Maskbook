import { useState } from 'react'
import DialogContent from '@mui/material/DialogContent'
// import { walletDialogShowSettings } from '../settings'
import { InjectedDialog } from '@masknet/shared'
import WalletBar from './WalletBar'
import GameList from './GameList'

const WalletConnectDialog = () => {
    const [isShow, setShow] = useState(true)

    const handleClose = () => {
        setShow(false)
    }

    // const isShow = useValueRef<boolean>(walletDialogShowSettings)

    return (
        <InjectedDialog onClose={handleClose} open={isShow} title="Game">
            <DialogContent>
                <WalletBar />
                <GameList />
            </DialogContent>
        </InjectedDialog>
    )
}

export default WalletConnectDialog
