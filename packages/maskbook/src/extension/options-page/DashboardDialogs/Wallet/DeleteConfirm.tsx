import { Button } from '@material-ui/core'
import { CreditCard as CreditCardIcon } from 'react-feather'
import { useI18N } from '../../../../utils'
import { WalletRPC } from '../../../../plugins/Wallet/messages'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../../DashboardComponents/SpacedButtonGroup'
import { DashboardDialogCore, DashboardDialogWrapper, useSnackbarCallback, WrappedDialogProps } from '../Base'
import type { WalletProps } from './types'
import {
    currentAccountSettings,
    currentChainIdSettings,
    currentNetworkSettings,
    currentProviderSettings,
} from '../../../../plugins/Wallet/settings'
import { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared'

export function DashboardWalletDeleteConfirmDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const { wallet } = props.ComponentProps!
    const onConfirm = useSnackbarCallback(
        async () => {
            await WalletRPC.removeWallet(wallet.address)
            currentAccountSettings.value = ''
            currentChainIdSettings.value = ChainId.Mainnet
            currentNetworkSettings.value = NetworkType.Ethereum
            currentProviderSettings.value = ProviderType.Maskbook
        },
        [wallet.address],
        props.onClose,
    )
    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<CreditCardIcon />}
                iconColor="#F4637D"
                primary={t('delete_wallet')}
                secondary={t('delete_wallet_hint')}
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton
                            variant="contained"
                            color="danger"
                            onClick={onConfirm}
                            data-testid="confirm_button">
                            {t('confirm')}
                        </DebounceButton>
                        <Button variant="outlined" color="inherit" onClick={props.onClose}>
                            {t('cancel')}
                        </Button>
                    </SpacedButtonGroup>
                }
            />
        </DashboardDialogCore>
    )
}
