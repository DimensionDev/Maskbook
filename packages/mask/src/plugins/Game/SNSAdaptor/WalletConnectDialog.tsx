import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { DialogContent, alpha, DialogActions } from '@mui/material'
import { useCustomSnackbar, makeStyles } from '@masknet/theme'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    useRemoteControlledDialog,
    InjectedDialog,
    PluginWalletStatusBar,
    ChainBoundary,
    WalletStatusModal,
    ApplicationBoardModal,
} from '@masknet/shared'
import { PluginGameMessages } from '../messages.js'
import GameList from './GameList.js'
import GameWindow from './GameWindow.js'
import GameShareDialog from './GameShareDialog.js'
import type { GameInfo, GameNFT } from '../types.js'
import { useI18N } from '../locales/index.js'

export const ConnectContext = createContainer(() => {
    const [isGameShow, setGameShow] = useState(false)
    const [tokenProps, setTokenProps] = useState<GameNFT>()
    const [gameInfo, setGameInfo] = useState<GameInfo>()

    return {
        isGameShow,
        setGameShow,
        tokenProps,
        setTokenProps,
        gameInfo,
        setGameInfo,
    }
})

const useStyles = makeStyles()((theme) => ({
    shareDialog: {
        minHeight: 200,
    },
    dialogActions: {
        padding: '0px !important',
        boxShadow: `0px 0px 20px ${alpha(
            theme.palette.maskColor.shadowBottom,
            theme.palette.mode === 'dark' ? 0.12 : 0.05,
        )}`,
    },
}))

function WalletConnectDialog() {
    const t = useI18N()
    const { classes } = useStyles()
    const { showSnackbar } = useCustomSnackbar()
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { isGameShow, setGameShow, tokenProps, setTokenProps, gameInfo, setGameInfo } = ConnectContext.useContainer()

    const { open, closeDialog } = useRemoteControlledDialog(PluginGameMessages.events.gameDialogUpdated, (ev) => {
        if (ev?.tokenProps) setTokenProps(ev.tokenProps)
    })

    const handleGameClose = () => {
        setGameShow(false)
        setGameInfo(undefined)
    }

    const handleGameOpen = (gameInfo: GameInfo) => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) {
            showSnackbar(t.game_list_play_evm_error(), { variant: 'error' })
            return
        }
        if (gameInfo.wallet && !account) {
            showSnackbar(t.game_list_play_error(), { variant: 'error' })
            return
        }
        ApplicationBoardModal.close()
        WalletStatusModal.close()
        setGameInfo(gameInfo)
        setGameShow(true)
    }

    const [isShareShow, setShareShow] = useState(false)
    const handleGameShare = () => setShareShow(true)
    const closeGameShare = () => setShareShow(false)

    if (!open) return null

    return (
        <>
            <InjectedDialog onClose={closeDialog} open={open} title={t.game_name()} titleBarIconStyle="back">
                <DialogContent>
                    <GameList onPlay={handleGameOpen} />
                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                    <PluginWalletStatusBar>
                        <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId} />
                    </PluginWalletStatusBar>
                </DialogActions>
            </InjectedDialog>
            <GameWindow
                gameInfo={gameInfo}
                tokenProps={tokenProps}
                isShow={isGameShow}
                isShadow={isShareShow}
                onClose={handleGameClose}
                onShare={handleGameShare}
            />
            <InjectedDialog
                classes={{ paper: classes.shareDialog }}
                onClose={closeGameShare}
                open={isShareShow}
                title={t.game_share_title()}>
                <DialogContent>
                    <GameShareDialog gameInfo={gameInfo} onClose={closeGameShare} />
                </DialogContent>
            </InjectedDialog>
        </>
    )
}

export default WalletConnectDialog
