import { useState } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import DialogContent from '@mui/material/DialogContent'
import { PluginGameMessages } from '../messages'

import { InjectedDialog } from '@masknet/shared'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import GameList from './GameList'
import GameWindow from './GameWindow'

import { WalletMessages } from '../../Wallet/messages'
import type { GameInfo, GameNFT } from '../types'

const WalletConnectDialog = () => {
    const [isGameShow, setGameShow] = useState(false)
    const [tokenProps, setTokenProps] = useState<GameNFT>()
    const [gameInfo, setGameInfo] = useState<GameInfo>()

    const { open, closeDialog } = useRemoteControlledDialog(PluginGameMessages.events.gameDialogUpdated, (ev) => {
        if (ev?.tokenProps) setTokenProps(ev.tokenProps)
    })

    const handleGameClose = () => {
        setGameShow(false)
        setGameInfo(undefined)
    }

    const handleGameOpen = (gameInfo: GameInfo) => {
        closeDialog()
        closeWalletDialog()
        setGameInfo(gameInfo)
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
            <GameWindow gameInfo={gameInfo} tokenProps={tokenProps} isShow={isGameShow} onClose={handleGameClose} />
        </>
    )
}

export default WalletConnectDialog
