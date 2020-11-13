import React, { useCallback } from 'react'
import { Button, createStyles, DialogActions, DialogContent, makeStyles } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../messages'
import { useWallets, useSelectedWallet } from '../hooks/useWallet'
import { WalletInList } from '../../../components/shared/SelectWallet/WalletInList'
import type { WalletRecord } from '../database/types'
import Services from '../../../extension/service'
import { DashboardRoute } from '../../../extension/options-page/Route'
import { sleep } from '../../../utils/utils'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { currentSelectedWalletAddressSettings } from '../settings'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'

const useStyles = makeStyles((theme) => createStyles({}))

interface SelectWalletDialogUIProps extends withClasses<never> {}

function SelectWalletDialogUI(props: SelectWalletDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const selectedWallet = useSelectedWallet()
    const wallets = useWallets()

    //#region remote controlled dialog logic
    const [open, setSelectWalletDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectWalletDialogUpdated)
    const onClose = useCallback(() => {
        setSelectWalletDialogOpen({
            open: false,
        })
    }, [setSelectWalletDialogOpen])
    //#endregion

    const onSelect = useCallback(
        (wallet: WalletRecord) => {
            currentSelectedWalletAddressSettings.value = wallet.address
            onClose()
        },
        [onClose],
    )

    //#region create new wallet
    const history = useHistory()
    const onCreate = useCallback(async () => {
        onClose()
        await sleep(100)
        if (isEnvironment(Environment.ManifestOptions)) history.push(`${DashboardRoute.Wallets}?create=${Date.now()}`)
        else await Services.Welcome.openOptionsPage(DashboardRoute.Wallets, `create=${Date.now()}`)
    }, [history, onClose])
    //#endregion

    //#region connect wallet
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(async () => {
        onClose()
        await sleep(100)
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [onClose, setSelectProviderDialogOpen])
    //#endregion

    return (
        <>
            <InjectedDialog open={open} onExit={onClose} title="Select Wallet">
                <DialogContent>
                    {wallets.map((wallet) => (
                        <WalletInList
                            key={wallet.address}
                            wallet={wallet}
                            disabled={selectedWallet?.address === wallet.address}
                            onClick={() => onSelect(wallet)}
                        />
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button variant="text" onClick={onCreate}>
                        {t('plugin_wallet_on_create')}
                    </Button>
                    <Button variant="text" onClick={onConnect}>
                        {t('plugin_wallet_on_connect')}
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
