import { useCallback } from 'react'
import { activatedSocialNetworkUI } from '../../../../social-network/index.js'
import { useI18N } from '../../locales/index.js'
import { ConfirmModal, ConfirmModalProps } from '../common/ConfirmModal.js'

export interface TipsTransactionProps extends ConfirmModalProps {
    shareText: string
    onSubmit?(): void
}
export function TipsTransaction({ onSubmit, shareText, ...rest }: TipsTransactionProps) {
    const t = useI18N()
    const enableShare = !!activatedSocialNetworkUI.utils.share
    const handleConfirm = useCallback(() => {
        if (enableShare) {
            activatedSocialNetworkUI.utils.share?.(shareText)
        }
        onSubmit?.()
    }, [shareText, onsubmit])

    return (
        <ConfirmModal
            {...rest}
            title={t.tips()}
            confirmText={enableShare ? t.tip_share() : t.tip_success_ok()}
            onConfirm={handleConfirm}
        />
    )
}
