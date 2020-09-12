import React, { useState, useEffect } from 'react'
import { makeStyles, Theme, createStyles, DialogContent, GridList, GridListTile } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { getActivatedUI } from '../../../social-network/ui'
import { useTwitterDialog } from '../../../social-network-provider/twitter.com/utils/theme'
import { MessageCenter } from '../../../utils/messages'
import { Provider } from './Provider'
import { getUrl } from '../../../utils/utils'
import { MetaMaskIcon } from '../../../resources/MetaMaskIcon'
import { MaskbookIcon } from '../../../resources/MaskbookIcon'
import { WalletConnectIcon } from '../../../resources/WalletConnectIcon'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            width: '750px !important',
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

    // //#region dialog
    const [open, setOpen] = useState(true)

    // // submit token
    // const onSelect = (address: string) => {
    //     setOpen(false)
    //     setTimeout(() => {
    //         MessageCenter.emit('selectTokenDialogUpdated', {
    //             open: false,
    //             token: address ? tokens.find((x) => x.address === address) : undefined,
    //         })
    //     })
    // }

    // // open dialog from message center
    // useEffect(() => {
    //     if (open) return
    //     MessageCenter.on('selectTokenDialogUpdated', (ev) => {
    //         if (!ev.open) return // expect open dialog
    //         setOpen(true)
    //     })
    // }, [open])

    // // close dialog with message center
    // const onClose = () => {
    //     if (!open) return
    //     setOpen(!open)
    //     setTimeout(() => {
    //         MessageCenter.emit('selectTokenDialogUpdated', {
    //             open: false,
    //         })
    //     }, 100)
    // }
    // //#endregion

    const onClose = () => {}

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
                onExit={onClose}
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
                            />
                        </GridListTile>
                        <GridListTile>
                            <Provider
                                logo={<MetaMaskIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="MetaMask"
                                description="Connect to your MetaMask Wallet"
                            />
                        </GridListTile>
                        <GridListTile>
                            <Provider
                                logo={<WalletConnectIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="WalletConnect"
                                description="Scan with WalletConnect to connect"
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
