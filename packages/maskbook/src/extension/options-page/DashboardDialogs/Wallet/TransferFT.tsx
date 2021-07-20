import { useState } from 'react'
import { Send as SendIcon } from 'react-feather'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'
import { useI18N } from '../../../../utils/i18n-next-ui'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import { ReceiveTab } from './ReceiveTab'
import { TransferTab } from './TransferTab'
import type { WalletProps } from './types'

export function DashboardWalletTransferDialogFT(
    props: WrappedDialogProps<WalletProps & { token: FungibleTokenDetailed }>,
) {
    const { wallet, token } = props.ComponentProps!
    const { t } = useI18N()
    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('wallet_transfer_send'),
                children: <TransferTab wallet={wallet} token={token} onClose={props.onClose} />,
                sx: { p: 0 },
            },
            {
                label: t('wallet_transfer_receive'),
                children: <ReceiveTab wallet={wallet} onClose={props.onClose} />,
                sx: { p: 0 },
            },
        ],
        state,
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                primary={t('wallet_transfer_title')}
                icon={<SendIcon />}
                iconColor="#4EE0BC"
                size="medium"
                content={<AbstractTab height={268} {...tabProps} />}
            />
        </DashboardDialogCore>
    )
}
