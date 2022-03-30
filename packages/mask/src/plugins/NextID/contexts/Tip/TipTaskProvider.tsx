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
    const [tipType, setTipType] = useState<TipType>(TipType.Token)
    const [amount, setAmount] = useState('')
    const { targetChainId } = TargetChainIdContext.useContainer()
    const [erc721Contract, setErc721Contract] = useState<ContextOptions['erc721Contract']>(null)
    const nativeTokenDetailed = useNativeTokenDetailed(targetChainId)
    const [token, setToken] = useState<ContextOptions['token']>(nativeTokenDetailed)
    const [erc721TokenId, setErc721TokenId] = useState<ContextOptions['erc721TokenId']>(null)

    useEffect(() => {
        setTipType(TipType.Token)
    }, [targetChainId])

    useEffect(() => {
        setRecipient(task.to || '')
    }, [task.to])

    useEffect(() => {
        if (recipient || task.addresses.length === 0) return
        setRecipient(task.addresses[0])
    }, [recipient, task.addresses])

    useEffect(() => {
        if (!nativeTokenDetailed) return
        setToken(nativeTokenDetailed)
    }, [nativeTokenDetailed])
    const tokenTipTuple = useTokenTip(recipient, token, amount)
    const nftTipTuple = useNftTip(recipient, erc721TokenId, erc721Contract)

    const sendTipTuple = tipType === TipType.Token ? tokenTipTuple : nftTipTuple
    const sendState = sendTipTuple[0]
    const sendTip = sendTipTuple[1]

    const contextValue = useMemo(() => {
        const isSending = [
            TransactionStateType.WAIT_FOR_CONFIRMING,
            TransactionStateType.HASH,
            TransactionStateType.RECEIPT,
        ].includes(sendState.type)

        return {
            recipient,
            recipientSnsId: task.recipientSnsId || '',
            setRecipient,
            recipients: task.addresses,
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
        task.addresses,
        tipType,
        amount,
        erc721TokenId,
        erc721Contract,
        token,
        sendTip,
        sendState,
    ])
    return <TipContext.Provider value={contextValue}>{children}</TipContext.Provider>
}

export function useTip() {
    return useContext(TipContext)
}
