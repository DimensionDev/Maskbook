import { useCallback } from 'react'
import { activatedSocialNetworkUI } from '../../../../social-network/index.js'
import { useI18N } from '../../locales/index.js'
import { useNonFungibleAsset } from '@masknet/web3-hooks-base'
import { TokenTransactionConfirmModal, type TokenTransactionConfirmModalProps } from '@masknet/shared'

export interface TransactionConfirmDialogProps extends TokenTransactionConfirmModalProps {
    shareText: string
    onSubmit?(): void
}
export function TransactionConfirmDialog({ onSubmit, shareText, ...rest }: TransactionConfirmDialogProps) {
    const t = useI18N()
    const enableShare = !!activatedSocialNetworkUI.utils.share
    const handleConfirm = useCallback(() => {
        if (enableShare) {
            activatedSocialNetworkUI.utils.share?.(shareText)
        }
        onSubmit?.()
    }, [shareText, onsubmit])

    const { value: nonFungibleToken } = useNonFungibleAsset(
        undefined,
        rest.nonFungibleTokenAddress,
        rest.nonFungibleTokenId ?? '',
    )
    return (
        <TokenTransactionConfirmModal
            {...rest}
            messageTextForNFT={t.claim_nft_successful({
                name: nonFungibleToken?.contract?.name || 'NFT',
            })}
            messageTextForFT={t.claim_token_successful({
                amount: rest.amount ?? '',
                name: `$${rest.token?.symbol}`,
            })}
            title={t.lucky_drop()}
            confirmText={enableShare ? t.share() : t.ok()}
            onConfirm={handleConfirm}
        />
    )
}
