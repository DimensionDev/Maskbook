import { useState } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import DialogContent from '@mui/material/DialogContent'
import { PluginGameMessages } from '../messages'

import { InjectedDialog } from '@masknet/shared'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import GameList from './GameList'
import GameWindow from './GameWindow'
import GameShareDialog from './GameShareDialog'

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

    const [isShareShow, setShareShow] = useState(false)
    const [shareUrl, setShareUrl] = useState('')
    const handleGameShare = (gameInfo: GameInfo) => {
        setShareShow(true)
        setShareUrl(gameInfo.url)
    }
    const closeGameShare = () => {
        setShareShow(false)
        setShareUrl('')
    }

    return (
        <>
            <InjectedDialog onClose={closeDialog} open={open} title="Game">
                <DialogContent>
                    <WalletStatusBox />
                    <GameList onPlay={handleGameOpen} onShare={handleGameShare} />
                </DialogContent>
            </InjectedDialog>
            <GameWindow gameInfo={gameInfo} isShow={isGameShow} onClose={handleGameClose} />
            <InjectedDialog onClose={closeGameShare} open={isShareShow} title="Share">
                <DialogContent>
                    <GameShareDialog shareUrl={shareUrl} onClose={closeGameShare} />
                </DialogContent>
            </InjectedDialog>

            {/* {!!isShareShow && <GameShareDialog shareUrl={shareUrl} onClose={closeGameShare} />} */}
        </>
    )
}

export default WalletConnectDialog
