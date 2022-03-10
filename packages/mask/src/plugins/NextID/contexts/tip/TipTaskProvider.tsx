import { TransactionStateType, useNativeTokenDetailed } from '@masknet/web3-shared-evm'
import { FC, useContext, useEffect, useMemo, useState } from 'react'
import { TipTask, TipType } from '../../types'
import { TargetChainIdContext } from '../TargetChainIdContext'
import { ContextOptions, TipContext } from './TipContext'
import { useNftTip } from './useNftTip'
import { useTokenTip } from './useTokenTip'

interface Props {
    task: TipTask
}

export const TipTaskProvider: FC<Props> = ({ children, task }) => {
    const [recipient, setRecipient] = useState('')
    const [recipients, setRecipients] = useState<string[]>(task.addresses)
    const [tipType, setTipType] = useState<TipType>(TipType.Token)
    const [amount, setAmount] = useState('')
    const { targetChainId } = TargetChainIdContext.useContainer()
    const [erc721Contract, setErc721Contract] = useState<ContextOptions['erc721Contract']>(null)
    const { value: nativeTokenDetailed = null } = useNativeTokenDetailed(targetChainId)
    const [token, setToken] = useState<ContextOptions['token']>(nativeTokenDetailed)
    const [erc721TokenId, setErc721TokenId] = useState<ContextOptions['erc721TokenId']>(null)

    useEffect(() => {
        setRecipient(task.to || '')
    }, [task.to])

    useEffect(() => {
        setRecipients(task.addresses)
    }, [task.addresses])

    useEffect(() => {
        if (recipient || recipients.length === 0) return
        setRecipient(recipients[0])
    }, [recipient, recipients])

    useEffect(() => {
        if (!nativeTokenDetailed) return
        setToken(nativeTokenDetailed)
    }, [nativeTokenDetailed])
    const tokenTipTuple = useTokenTip(recipient, token, amount)
    const nftTipTuple = useNftTip(recipient, erc721TokenId, erc721Contract)

    const sendTipTuple = tipType === TipType.Token ? tokenTipTuple : nftTipTuple
    const sendState = sendTipTuple[0]
    const sendTip = sendTipTuple[1]

    const isSending = [
        TransactionStateType.WAIT_FOR_CONFIRMING,
        TransactionStateType.HASH,
        TransactionStateType.RECEIPT,
    ].includes(sendState.type)

    const contextValue = useMemo(() => {
        return {
            recipient,
            recipientSnsId: task.recipientSnsId || '',
            setRecipient,
            recipients,
            setRecipients,
            tipType,
            setTipType,
            token,
            setToken,
            amount,
            setAmount,
            erc721TokenId,
            setErc721TokenId,
            erc721Contract,
            setErc721Contract,
            sendTip,
            isSending,
            sendState,
        }
    }, [
        recipient,
        task.recipientSnsId,
        recipients,
        tipType,
        amount,
        erc721TokenId,
        erc721Contract,
        token,
        sendTip,
        isSending,
        sendState,
    ])
    return <TipContext.Provider value={contextValue}>{children}</TipContext.Provider>
}

export function useTip() {
    return useContext(TipContext)
}
