import { GasConfig, useChainId, useERC721ContractDetailed, useNativeTokenDetailed } from '@masknet/web3-shared-evm'
import { FC, useContext, useEffect, useMemo, useState } from 'react'
import { useSubscription } from 'use-subscription'
import { getStorage } from '../../storage'
import { TipTask, TipType } from '../../types'
import { TargetChainIdContext } from '../TargetChainIdContext'
import { ContextOptions, TipContext } from './TipContext'
import { useNftTip } from './useNftTip'
import { useTokenTip } from './useTokenTip'

interface Props {
    task: TipTask
}

export const TipTaskProvider: FC<React.PropsWithChildren<Props>> = ({ children, task }) => {
    const [recipient, setRecipient] = useState('')
    const [tipType, setTipType] = useState<TipType>(TipType.Token)
    const [amount, setAmount] = useState('')
    const { targetChainId } = TargetChainIdContext.useContainer()
    const chainId = useChainId()
    const [erc721Address, setErc721Address] = useState<string>('')
    const { value: nativeTokenDetailed = null } = useNativeTokenDetailed(targetChainId)
    const [token, setToken] = useState<ContextOptions['token']>(nativeTokenDetailed)
    const [erc721TokenId, setErc721TokenId] = useState<ContextOptions['erc721TokenId']>(null)
    const storedTokens = useSubscription(getStorage().addedTokens.subscription)

    const { value: erc721Contract } = useERC721ContractDetailed(erc721Address)

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
    const [gasConfig, setGasConfig] = useState<GasConfig | undefined>()
    const tokenTipTuple = useTokenTip(recipient, token, amount, gasConfig)
    const nftTipTuple = useNftTip(recipient, erc721TokenId, erc721Address)

    const sendTipTuple = tipType === TipType.Token ? tokenTipTuple : nftTipTuple
    const isSending = sendTipTuple[0]
    const sendTip = sendTipTuple[1]

    const contextValue = useMemo(() => {
        const reset = () => {
            setAmount('')
            setErc721TokenId(null)
            setErc721Address('')
        }

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
            erc721Contract: erc721Contract || null,
            erc721Address,
            setErc721Address,
            sendTip,
            isSending,
            storedTokens: storedTokens.filter((t) => t.contract?.chainId === chainId),
            reset,
            setGasConfig,
        }
    }, [
        chainId,
        recipient,
        task.recipientSnsId,
        task.addresses,
        tipType,
        amount,
        erc721TokenId,
        erc721Contract,
        erc721Address,
        token,
        sendTip,
        isSending,
        storedTokens,
    ])
    return <TipContext.Provider value={contextValue}>{children}</TipContext.Provider>
}

export function useTip() {
    return useContext(TipContext)
}
