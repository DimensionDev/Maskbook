import { useCallback } from 'react'
import { TokenTransactionConfirmModal, type TokenTransactionConfirmModalProps } from '../../../index.js'
import { Trans } from '@lingui/macro'

export interface TransactionConfirmProps extends TokenTransactionConfirmModalProps {
    shareText: string
    onSubmit?(): void
    share?: (text: string) => void
    title?: string
    messageTextForNFT?: string
    messageTextForFT?: string
    open: boolean
    onClose: () => void
}
export function TransactionConfirm({ onSubmit, shareText, share, ...rest }: TransactionConfirmProps) {
    const handleConfirm = useCallback(() => {
        share?.(shareText)
        onSubmit?.()
    }, [shareText, onSubmit, share])
    return (
        <TokenTransactionConfirmModal
            {...rest}
            messageTextForNFT={rest.messageTextForNFT}
            messageTextForFT={rest.messageTextForFT}
            title={rest.title}
            confirmText={share ? <Trans>Share</Trans> : <Trans>OK</Trans>}
            onConfirm={handleConfirm}
        />
    )
}
