import { useCallback } from 'react'
import { useSharedI18N, type TokenTransactionConfirmModalProps, TokenTransactionConfirmModal } from '../../index.js'

export interface TransactionConfirmProps extends TokenTransactionConfirmModalProps {
    shareText: string
    onSubmit?(): void
    share?: (text: string) => void
    title?: string
    messageTextForNFT?: string
    messageTextForFT?: string
}
export function TransactionConfirm({ onSubmit, shareText, share, ...rest }: TransactionConfirmProps) {
    const t = useSharedI18N()
    const handleConfirm = useCallback(() => {
        share?.(shareText)
        onSubmit?.()
    }, [shareText, onsubmit, share])
    return (
        <TokenTransactionConfirmModal
            {...rest}
            messageTextForNFT={rest.messageTextForNFT}
            messageTextForFT={rest.messageTextForFT}
            title={rest.title}
            confirmText={share ? t.share() : t.ok()}
            onConfirm={handleConfirm}
        />
    )
}
