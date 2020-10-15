import React, { useCallback } from 'react'
import { Button, createStyles, makeStyles } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { useTwitterDialog } from '../../../social-network-provider/twitter.com/utils/theme'
import { getActivatedUI } from '../../../social-network/ui'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { MaskbookWalletMessages, WalletMessageCenter } from '../messages'
import { useDefaultWallet, useWallets } from '../hooks/useWallet'
import { WalletInList } from '../../../components/shared/SelectWallet/WalletInList'
import type { WalletRecord } from '../database/types'
import Services from '../../../extension/service'
import { DashboardRoute } from '../../../extension/options-page/Route'
import { sleep } from '../../../utils/utils'
import { GetContext } from '@holoflows/kit/es'

const useStyles = makeStyles((theme) =>
    createStyles({
        paper: {
            width: '450px !important',
            padding: theme.spacing(2),
        },
        header: {
            display: 'none',
        },
        content: {
            overflow: 'auto',
            maxHeight: 500,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        footer: {
            paddingTop: theme.spacing(1),
            display: 'flex',
            justifyContent: 'flex-end',
        },
    }),
)

interface SelectWalletDialogUIProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'root'
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'header'
        | 'content'
        | 'footer'
    > {}

function SelectWalletDialogUI(props: SelectWalletDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const wallets = useWallets()
    const defaultWallet = useDefaultWallet()

    //#region remote controlled dialog logic
    const [open, setSelectWalletDialogOpen] = useRemoteControlledDialog<
        MaskbookWalletMessages,
        'selectWalletDialogUpdated'
    >(WalletMessageCenter, 'selectWalletDialogUpdated')
    const onClose = useCallback(() => {
        setSelectWalletDialogOpen({
            open: false,
        })
    }, [setSelectWalletDialogOpen])
    //#endregion

    const onSelect = useCallback((wallet: WalletRecord) => {
        Services.Plugin.invokePlugin('maskbook.wallet', 'setDefaultWallet', wallet.address)
        onClose()
    }, [])

    //#region create new wallet
    const history = useHistory()
    const onCreate = useCallback(async () => {
        if (GetContext() === 'options') history.push(`${DashboardRoute.Wallets}?create=${Date.now()}`)
        else await Services.Welcome.openOptionsPage(DashboardRoute.Wallets, `create=${Date.now()}`)
    }, [history])
    //#endregion

    //#region connect wallet
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog<
        MaskbookWalletMessages,
        'selectProviderDialogUpdated'
    >(WalletMessageCenter, 'selectProviderDialogUpdated')
    const onConnect = useCallback(async () => {
        onClose()
        await sleep(100)
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [])
    //#endregion

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
                <div className={classes.header}></div>
                <div className={classes.content}>
                    {wallets.map((wallet) => (
                        <WalletInList
                            key={wallet.address}
                            disabled={wallet.address === defaultWallet?.address}
                            wallet={wallet}
                            onClick={() => onSelect(wallet)}></WalletInList>
                    ))}
                </div>
                <div className={classes.footer}>
                    <Button variant="text" onClick={onCreate}>
                        {t('create_wallet')}
                    </Button>
                    <Button variant="text" onClick={onConnect}>
                        {t('connect_wallet')}
                    </Button>
                </div>
            </ShadowRootDialog>
        </div>
    )
}

export interface SelectWalletDialogProps extends SelectWalletDialogUIProps {}

export function SelectWalletDialog(props: SelectWalletDialogProps) {
    const ui = getActivatedUI()
    const twitterClasses = {
        ...useTwitterDialog(),
    }
    return ui.internalName === 'twitter' ? (
        <SelectWalletDialogUI classes={twitterClasses} {...props} />
    ) : (
        <SelectWalletDialogUI {...props} />
    )
}
