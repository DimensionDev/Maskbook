import { useState, useCallback } from 'react'
import { Button, DialogActions, DialogContent } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { ProviderType, useWallets, useWallet, NetworkType } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { DashboardRoutes } from '@masknet/shared-base'
import { useI18N } from '../../../utils'
import { WalletMessages, WalletRPC } from '../messages'
import { WalletInList } from '../../../components/shared/SelectWallet/WalletInList'
import Services from '../../../extension/service'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { delay } from '@dimensiondev/kit'

const useStyles = makeStyles()({
    content: {
        padding: 0,
        minHeight: 300,
    },
})

interface SelectWalletDialogUIProps extends withClasses<never> {}

function SelectWalletDialogUI(props: SelectWalletDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const wallets = useWallets(ProviderType.MaskWallet)
    const selectedWallet = useWallet()

    // #region remote controlled dialog logic
    const [networkType, setNetworkType] = useState<NetworkType | undefined>()
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.selectWalletDialogUpdated, (ev) => {
        if (!ev.open) return
        setNetworkType(ev.networkType)
    })
    // #endregion

    const onSelect = useCallback(
        async (address: string) => {
            closeDialog()
            await WalletRPC.updateAccount({
                account: address,
                providerType: ProviderType.MaskWallet,
                networkType,
            })
        },
        [networkType, closeDialog],
    )

    // #region create new wallet
    const onCreate = useCallback(async () => {
        closeDialog()
        await delay(100)
        await Services.Welcome.openOptionsPage(DashboardRoutes.CreateMaskWallet, `create=${Date.now()}`)
    }, [history, closeDialog])
    // #endregion

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
