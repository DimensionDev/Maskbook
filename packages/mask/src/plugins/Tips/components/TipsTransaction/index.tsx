import { useCallback } from 'react'
import { activatedSocialNetworkUI } from '../../../../social-network/index.js'
import { useI18N } from '../../locales/index.js'
import { useNonFungibleAsset } from '@masknet/web3-hooks-base'
import { TokenTransactionConfirmModal, type TokenTransactionConfirmModalProps } from '@masknet/shared'

export interface TipsTransactionProps extends TokenTransactionConfirmModalProps {
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

    const { value: nonFungibleToken } = useNonFungibleAsset(
        undefined,
        rest.nonFungibleTokenAddress,
        rest.nonFungibleTokenId ?? '',
    )

    return (
        <TokenTransactionConfirmModal
            {...rest}
            messageTextForNFT={t.send_specific_tip_successfully({
                amount: '1',
                name: nonFungibleToken?.contract?.name || 'NFT',
            })}
            messageTextForFT={t.send_specific_tip_successfully({
                amount: rest.amount ?? '',
                name: `$${rest.token?.symbol}`,
            })}
            title={t.tips()}
            confirmText={enableShare ? t.tip_share() : t.tip_success_ok()}
            onConfirm={handleConfirm}
        />
    )
}
