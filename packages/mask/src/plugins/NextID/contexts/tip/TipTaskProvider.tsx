import { TransactionStateType, useNativeTokenDetailed } from '@masknet/web3-shared-evm'
import { FC, useContext, useEffect, useMemo, useState } from 'react'
import { TipTask, TipType } from '../../types'
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
    const [erc721Contract, setErc721Contract] = useState<ContextOptions['erc721Contract']>(null)
    const { value: nativeTokenDetailed = null } = useNativeTokenDetailed()
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
        if (token || !nativeTokenDetailed) return
        setToken(nativeTokenDetailed)
    }, [token, nativeTokenDetailed])

    const contextValue = useMemo(() => {
        return {
            recipient,
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
        }
    }, [recipient, recipients, tipType, amount, erc721TokenId, erc721Contract, token])
    return <TipContext.Provider value={contextValue}>{children}</TipContext.Provider>
}

export function useTip() {
    const context = useContext(TipContext)
    const tokenTipTuple = useTokenTip()
    const nftTipTuple = useNftTip()

    const sendTipTuple = context.tipType === TipType.Token ? tokenTipTuple : nftTipTuple
    const isSending = [
        TransactionStateType.WAIT_FOR_CONFIRMING,
        TransactionStateType.HASH,
        TransactionStateType.RECEIPT,
    ].includes(sendTipTuple[0].type)

    return {
        ...context,
        isSending,
        sendState: sendTipTuple[0],
        sendTip: sendTipTuple[1],
    }
}
