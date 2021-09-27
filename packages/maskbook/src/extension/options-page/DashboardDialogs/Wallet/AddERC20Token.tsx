import { useState } from 'react'
import type { ERC20TokenDetailed } from '@masknet/web3-shared'
import { useSnackbarCallback } from '@masknet/shared'
import { Hexagon as HexagonIcon } from 'react-feather'
import { useI18N } from '../../../../utils'
import { WalletRPC } from '../../../../plugins/Wallet/messages'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import { ERC20PredefinedTokenSelector } from './ERC20PredefinedTokenSelector'
import type { WalletProps } from './types'

export function DashboardWalletAddERC20TokenDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const { wallet } = props.ComponentProps!
    const [token, setToken] = useState<ERC20TokenDetailed | null>(null)

    const onSubmit = useSnackbarCallback(
        async () => {
            if (!token) return
            await Promise.all([WalletRPC.addToken(token), WalletRPC.trustToken(wallet.address, token)])
        },
        [token],
        props.onClose,
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<HexagonIcon />}
                iconColor="#699CF7"
                primary={t('add_token')}
                content={
                    <ERC20PredefinedTokenSelector
                        excludeTokens={Array.from(wallet.erc20_token_whitelist)}
                        onTokenChange={setToken}
                    />
                }
                footer={
                    <DebounceButton disabled={!token} variant="contained" onClick={onSubmit}>
                        {t('add_token_symbol', {
                            symbol: token?.symbol ?? 'Token',
                        })}
                    </DebounceButton>
                }
            />
        </DashboardDialogCore>
    )
}
