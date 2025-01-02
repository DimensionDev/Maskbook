import { useState } from 'react'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TokenType } from '@masknet/web3-shared-base'
import { TransactionConfirm, type TransactionConfirmProps } from './TokenTransactionConfirm.js'

export interface TransactionConfirmModalOpenProps extends Omit<TransactionConfirmProps, 'open' | 'onClose'> {}

export function TransactionConfirmModal({ ref }: SingletonModalProps<TransactionConfirmModalOpenProps>) {
    const [shareText, setShareText] = useState('')
    const [share, setShare] = useState<(text: string) => void>()
    const [token, setToken] = useState<Web3Helper.FungibleTokenAll | null>()
    const [tokenType, setTokenType] = useState<TokenType>(TokenType.Fungible)
    const [messageTextForNFT, setMessageTextForNFT] = useState<string>()
    const [messageTextForFT, setMessageTextForFT] = useState<string>()
    const [message, setMessage] = useState<string>()
    const [title, setTitle] = useState<string>()
    const [nonFungibleTokenId, setNonFungibleTokenId] = useState<string>()
    const [nonFungibleTokenAddress, setNonFungibleTokenAddress] = useState<string>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setShareText(props.shareText)
            setShare(() => props.share)
            setToken(props.token)
            setTokenType(props.tokenType)
            setTitle(props.title)
            setMessageTextForFT(props.messageTextForFT)
            setMessageTextForNFT(props.messageTextForNFT)
            setMessage(props.message)
            setNonFungibleTokenId(props.nonFungibleTokenId ?? undefined)
            setNonFungibleTokenAddress(props.nonFungibleTokenAddress ?? undefined)
        },
    })

    if (!open) return null
    return (
        <TransactionConfirm
            shareText={shareText}
            open
            onClose={() => dispatch?.close()}
            tokenType={tokenType}
            nonFungibleTokenId={nonFungibleTokenId}
            nonFungibleTokenAddress={nonFungibleTokenAddress}
            token={token}
            onSubmit={() => dispatch?.close()}
            share={share}
            title={title}
            messageTextForFT={messageTextForFT}
            messageTextForNFT={messageTextForNFT}
            message={message}
        />
    )
}
