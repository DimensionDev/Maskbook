import React, { useCallback } from 'react'
import {
    Button,
    createStyles,
    DialogActions,
    DialogContent,
    List,
    ListSubheader,
    makeStyles,
    Typography,
} from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { MaskbookWalletMessages, WalletMessageCenter } from '../messages'
import { useWallets } from '../hooks/useWallet'
import { WalletInList } from '../../../components/shared/SelectWallet/WalletInList'
import type { WalletRecordDetailed } from '../database/types'
import Services from '../../../extension/service'
import { DashboardRoute } from '../../../extension/options-page/Route'
import { sleep } from '../../../utils/utils'
import { GetContext } from '@dimensiondev/holoflows-kit/es'
import { currentSelectedWalletProviderSettings, currentSelectedWalletAddressSettings } from '../settings'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { resolveProviderName } from '../../../web3/pipes'
import { ProviderType } from '../../../web3/types'
import { ProviderIcon } from '../../../components/shared/ProviderIcon'

const useStyles = makeStyles((theme) =>
    createStyles({
        paper: {
            height: 500,
        },
        content: {
            padding: theme.spacing(0, 2, 1, 2),
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        list: {
            padding: 0,
        },
        subHeader: {
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(2, 2, 1),
            backgroundColor: theme.palette.background.paper,
            '&:first-child': {
                paddingTop: 0,
            },
        },
        subHeaderIcon: {
            fontSize: 24,
            width: 24,
            height: 24,
        },
        subHeaderText: {
            fontSize: 14,
            marginLeft: theme.spacing(1),
        },
    }),
)

interface SelectWalletDialogUIProps extends withClasses<never> {}

function SelectWalletDialogUI(props: SelectWalletDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const wallets = useWallets()

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

    const onSelect = useCallback(
        (wallet: WalletRecordDetailed) => {
            currentSelectedWalletAddressSettings.value = wallet.address
            currentSelectedWalletProviderSettings.value = wallet.provider
            onClose()
        },
        [onClose],
    )

    //#region create new wallet
    const history = useHistory()
    const onCreate = useCallback(async () => {
        onClose()
        await sleep(100)
        if (GetContext() === 'options') history.push(`${DashboardRoute.Wallets}?create=${Date.now()}`)
        else await Services.Welcome.openOptionsPage(DashboardRoute.Wallets, `create=${Date.now()}`)
    }, [history, onClose])
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
        <>
            <InjectedDialog open={open} onExit={onClose} title="Select Wallet">
                <DialogContent className={classes.content}>
                    <List className={classes.list} dense>
                        {[ProviderType.MetaMask, ProviderType.WalletConnect, ProviderType.Maskbook].map((provider) =>
                            wallets.some((x) => x.provider === provider) ? (
                                <React.Fragment key={provider}>
                                    <ListSubheader className={classes.subHeader}>
                                        <ProviderIcon
                                            classes={{ icon: classes.subHeaderIcon }}
                                            size={24}
                                            providerType={provider}
                                        />
                                        <Typography className={classes.subHeaderText}>
                                            {resolveProviderName(provider)}
                                        </Typography>
                                    </ListSubheader>
                                    {wallets
                                        .filter((x) => x.provider === provider)
                                        .map((wallet) => (
                                            <WalletInList
                                                key={wallet.address}
                                                wallet={wallet}
                                                onClick={() => onSelect(wallet)}
                                            />
                                        ))}
                                </React.Fragment>
                            ) : null,
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button variant="text" onClick={onCreate}>
                        {t('create_wallet')}
                    </Button>
                    <Button variant="text" onClick={onConnect}>
                        {t('connect_wallet')}
                    </Button>
                </DialogActions>
            </InjectedDialog>
        </>
    )
}

export interface SelectWalletDialogProps extends SelectWalletDialogUIProps {}

export function SelectWalletDialog(props: SelectWalletDialogProps) {
    return <SelectWalletDialogUI {...props} />
}
