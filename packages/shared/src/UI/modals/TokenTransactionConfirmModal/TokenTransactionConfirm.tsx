import { useCallback } from 'react'
import { Trans } from '@lingui/react/macro'
import { TokenTransactionConfirmModal, type TokenTransactionConfirmModalProps } from '../../components/index.js'

export interface TransactionConfirmProps extends TokenTransactionConfirmModalProps {
    shareText: string
    onSubmit?(): void
    share?: (text: string) => void
    title?: string
    messageTextForNFT?: string
    messageTextForFT?: string
    message?: string
    open: boolean
    onClose: () => void
}
export function TransactionConfirm({ onSubmit, shareText, share, message, ...rest }: TransactionConfirmProps) {
    const handleConfirm = useCallback(() => {
        share?.(shareText)
        onSubmit?.()
    }, [shareText, onSubmit, share])
    return (
        <TokenTransactionConfirmModal
            {...rest}
            messageTextForNFT={rest.messageTextForNFT ?? message}
            messageTextForFT={rest.messageTextForFT ?? message}
            title={rest.title}
            confirmText={share ? <Trans>Share</Trans> : <Trans>OK</Trans>}
            onConfirm={handleConfirm}
        />
    )
}
