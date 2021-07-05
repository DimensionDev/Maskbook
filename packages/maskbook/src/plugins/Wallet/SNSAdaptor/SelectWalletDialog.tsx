import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, DialogActions, DialogContent, makeStyles } from '@material-ui/core'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { ProviderType, useWallets, useWallet, NetworkType, getChainIdFromNetworkType } from '@masknet/web3-shared'
import { delay, useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { WalletMessages } from '../messages'
import { WalletInList } from '../../../components/shared/SelectWallet/WalletInList'
import Services from '../../../extension/service'
import { DashboardRoute } from '../../../extension/options-page/Route'
import {
    currentChainIdSettings,
    currentAccountSettings,
    currentNetworkSettings,
    currentProviderSettings,
} from '../settings'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useState } from 'react'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: 0,
        minHeight: 300,
    },
}))

interface SelectWalletDialogUIProps extends withClasses<never> {}

function SelectWalletDialogUI(props: SelectWalletDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const wallets = useWallets(ProviderType.Maskbook)
    const selectedWallet = useWallet()

    //#region remote controlled dialog logic
    const [networkType, setNetworkType] = useState<NetworkType | undefined>()
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.selectWalletDialogUpdated, (ev) => {
        if (!ev.open) return
        setNetworkType(ev.networkType)
    })
    //#endregion

    const onSelect = useCallback(
        (address: string) => {
            closeDialog()
            currentAccountSettings.value = address
            currentProviderSettings.value = ProviderType.Maskbook
            if (networkType) {
                currentChainIdSettings.value = getChainIdFromNetworkType(networkType)
                currentNetworkSettings.value = networkType
            }
        },
        [networkType, closeDialog],
    )

    //#region create new wallet
    const history = useHistory()
    const onCreate = useCallback(async () => {
        closeDialog()
        await delay(100)
        if (isEnvironment(Environment.ManifestOptions)) history.push(`${DashboardRoute.Wallets}?create=${Date.now()}`)
        else await Services.Welcome.openOptionsPage(DashboardRoute.Wallets, `create=${Date.now()}`)
    }, [history, closeDialog])
    //#endregion

    return (
        <InjectedDialog open={open} onClose={closeDialog} title={t('plugin_wallet_select_a_wallet')} maxWidth="xs">
            <DialogContent className={classes.content}>
                {wallets.map((wallet) => (
                    <WalletInList
                        key={wallet.address}
                        wallet={wallet}
                        selected={selectedWallet?.address === wallet.address}
                        onClick={() => onSelect(wallet.address)}
                    />
                ))}
            </DialogContent>
            <DialogActions>
                <Button variant="text" onClick={onCreate}>
                    {t('plugin_wallet_on_create')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}

export interface SelectWalletDialogProps extends SelectWalletDialogUIProps {}

export function SelectWalletDialog(props: SelectWalletDialogProps) {
    return <SelectWalletDialogUI {...props} />
}
