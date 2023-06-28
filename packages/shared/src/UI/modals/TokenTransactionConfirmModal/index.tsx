import { forwardRef, useState } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TokenType } from '@masknet/web3-shared-base'
import { TransactionConfirm } from './TokenTransactionConfirm.js'

export interface TransactionConfirmModalOpenProps {
    shareText: string
    onSubmit?(): void
    share?: (text: string) => void
    amount: string | null
    token?: Web3Helper.FungibleTokenAll | null
    tokenType: TokenType
    title?: string
    messageTextForNFT?: string
    messageTextForFT?: string
}

export interface TransactionConfirmModalProps {}

export const TransactionConfirmModal = forwardRef<
    SingletonModalRefCreator<TransactionConfirmModalOpenProps>,
    TransactionConfirmModalProps
>((props, ref) => {
    const [shareText, setShareText] = useState('')
    const [onSubmit, setOnSubmit] = useState<() => void>()
    const [share, setShare] = useState<(text: string) => void>()
    const [amount, setAmount] = useState<string | null>(null)
    const [token, setToken] = useState<Web3Helper.FungibleTokenAll | null>()
    const [tokenType, setTokenType] = useState<TokenType>(TokenType.Fungible)
    const [messageTextForNFT, setMessageTextForNFT] = useState<string>()
    const [messageTextForFT, setMessageTextForFT] = useState<string>()
    const [title, setTitle] = useState<string>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setShareText(props.shareText)
            setOnSubmit(() => props.onSubmit)
            setShare(() => props.share)
            setAmount(props.amount)
            setToken(props.token)
            setTokenType(props.tokenType)
            setTitle(props.title)
            setMessageTextForFT(props.messageTextForFT)
            setMessageTextForNFT(props.messageTextForNFT)
        },
    })

    if (!open) return null
    return (
        <TransactionConfirm
            shareText={shareText}
            open
            onClose={() => dispatch?.close()}
            amount={amount}
            tokenType={tokenType}
            token={token}
            onSubmit={onSubmit}
            share={share}
            title={title}
            messageTextForFT={messageTextForFT}
            messageTextForNFT={messageTextForNFT}
        />
    )
})
