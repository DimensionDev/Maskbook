import { useCallback } from 'react'
import { activatedSocialNetworkUI } from '../../../../social-network/index.js'
import { useI18N } from '../../../../utils/index.js'
import { TokenTransactionConfirmModal, type TokenTransactionConfirmModalProps } from '@masknet/shared'

export interface TransactionConfirmDialogProps extends TokenTransactionConfirmModalProps {
    shareText: string
    onSubmit?(): void
}
export function TransactionConfirmDialog({ onSubmit, shareText, ...rest }: TransactionConfirmDialogProps) {
    const { t } = useI18N()
    const enableShare = !!activatedSocialNetworkUI.utils.share
    const handleConfirm = useCallback(() => {
        if (enableShare) {
            activatedSocialNetworkUI.utils.share?.(shareText)
        }
        onSubmit?.()
    }, [shareText, onsubmit])

    return (
        <TokenTransactionConfirmModal
            {...rest}
            messageTextForFT={t('plugin_ito_your_claimed_amount', {
                amount: rest.amount ?? '',
                symbol: `$${rest.token?.symbol}`,
            })}
            title={t('plugin_ito_name')}
            confirmText={enableShare ? t('share') : t('ok')}
            onConfirm={handleConfirm}
        />
    )
}
