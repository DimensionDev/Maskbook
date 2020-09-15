import React, { useCallback } from 'react'
import { MoreHorizontal } from 'react-feather'
import { makeStyles, Theme, createStyles, DialogContent, GridList, GridListTile } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { getActivatedUI } from '../../../social-network/ui'
import { useTwitterDialog } from '../../../social-network-provider/twitter.com/utils/theme'
import { Provider } from './Provider'
import { MetaMaskIcon } from '../../../resources/MetaMaskIcon'
import { MaskbookIcon } from '../../../resources/MaskbookIcon'
import { WalletConnectIcon } from '../../../resources/WalletConnectIcon'
import Services from '../../../extension/service'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { MessageCenter, MaskbookWalletMessages } from '../messages'
import { useBlurContext } from '../../../extension/options-page/DashboardContexts/BlurContext'
import { GetContext } from '@holoflows/kit/es'
import { DashboardRoute } from '../../../extension/options-page/Route'
import { ProviderType } from '../../../web3/types'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            width: '750px !important',
            maxWidth: 'unset',
        },
        backdrop: {
            ...(GetContext() === 'options'
                ? {
                      backgroundColor: 'transparent',
                  }
                : null),
        },
        content: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            overflow: 'hidden',
            padding: theme.spacing(2, 1),
        },
        grid: {
            width: '100%',
        },
        icon: {
            fontSize: 45,
        },
    }),
)

interface SelectProviderDialogUIProps
    extends withClasses<
        KeysInferFromUseStyles<typeof useStyles> | 'root' | 'dialog' | 'backdrop' | 'container' | 'paper' | 'content'
    > {}

function SelectProviderDialogUI(props: SelectProviderDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    //#region remote controlled dialog logic
    const [open, setOpen] = useRemoteControlledDialog<MaskbookWalletMessages, 'selectProviderDialogUpdated'>(
        MessageCenter,
        'selectProviderDialogUpdated',
    )
    const onClose = useCallback(() => {
        console.log('DEBUG: on close')
        setOpen({
            open: false,
        })
    }, [])
    //#endregion

    useBlurContext(open)

    const onConnect = useCallback(async (type: ProviderType) => {
        await Services.Welcome.openOptionsPage(DashboardRoute.Wallets)
        onClose()
    }, [])

    const onMetaMaskClick = useCallback(() => {
        alert('TO BE IMPLEMENTED')
    }, [])

    const onWalletConnectClick = useCallback(() => {
        alert('TO BE IMPLEMENTED')
    }, [])

    return (
        <div className={classes.root}>
            <ShadowRootDialog
                className={classes.dialog}
                classes={{
                    container: classes.container,
                    paper: classes.paper,
                }}
                open={open}
                scroll="body"
                fullWidth
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                onEscapeKeyDown={onClose}
                onBackdropClick={onClose}
                BackdropProps={{
                    className: classes.backdrop,
                }}>
                <DialogContent className={classes.content}>
                    <GridList className={classes.grid} spacing={16} cellHeight={183}>
                        <GridListTile>
                            <Provider
                                logo={<MaskbookIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="Maskbook"
                                description="Create wallet with Maskbook"
                                onClick={() => onConnect(ProviderType.Maskbook)}
                            />
                        </GridListTile>
                        <GridListTile>
                            <Provider
                                logo={<MetaMaskIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="MetaMask"
                                description="Connect to your MetaMask Wallet"
                                onClick={() => onConnect(ProviderType.MetaMask)}
                            />
                        </GridListTile>
                        <GridListTile>
                            <Provider
                                logo={<WalletConnectIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="WalletConnect"
                                description="Scan with WalletConnect to connect"
                                onClick={() => onConnect(ProviderType.WalletConnect)}
                            />
                        </GridListTile>
                        <GridListTile>
                            <Provider
                                logo={
                                    <MoreHorizontal
                                        className={classes.icon}
                                        viewBox="0 0 22.5 22.5"
                                        width={45}
                                        height={45}
                                    />
                                }
                                name="More"
                                description="Comming soon…"
                                ButtonBaseProps={{ disabled: true }}
                            />
                        </GridListTile>
                    </GridList>
                </DialogContent>
            </ShadowRootDialog>
        </div>
    )
}

export interface SelectProviderDialogProps extends SelectProviderDialogUIProps {}

export function SelectProviderDialog(props: SelectProviderDialogProps) {
    const ui = getActivatedUI()
    const twitterClasses = {
        ...useTwitterDialog(),
    }
    return ui.internalName === 'twitter' ? (
        <SelectProviderDialogUI classes={twitterClasses} {...props} />
    ) : (
        <SelectProviderDialogUI {...props} />
    )
}
