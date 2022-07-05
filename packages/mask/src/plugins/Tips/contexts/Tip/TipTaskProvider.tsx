import { useChainId, useFungibleToken, useNonFungibleTokenContract } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { GasConfig } from '@masknet/web3-shared-evm'
import { FC, useContext, useEffect, useMemo, useState } from 'react'
import { useSubscription } from 'use-subscription'
import { getStorage } from '../../storage'
import { TipTask, TipType } from '../../types'
import { TargetRuntimeContext } from '../TargetRuntimeContext'
import { ContextOptions, TipContext } from './TipContext'
import { useAddNameService } from './useAddNameService'
import { useNftTip } from './useNftTip'
import { useTokenTip } from './useTokenTip'

interface Props {
    task: TipTask
}

export const TipTaskProvider: FC<React.PropsWithChildren<Props>> = ({ children, task }) => {
    const { targetChainId, pluginId } = TargetRuntimeContext.useContainer()
    const [recipient, setRecipient] = useState(task.recipient ?? '')
    const recipients = useAddNameService(task.addresses)
    const [tipType, setTipType] = useState<TipType>(TipType.Token)
    const [amount, setAmount] = useState('')
    const chainId = useChainId()
    const [nonFungibleTokenAddress, setNonFungibleTokenAddress] = useState<string>('')
    const { value: nativeTokenDetailed = null } = useFungibleToken(pluginId, undefined, {
        chainId: targetChainId,
    })
    const [token, setToken] = useState<ContextOptions['token']>(nativeTokenDetailed)
    const [nonFungibleTokenId, setNonFungibleTokenId] = useState<ContextOptions['nonFungibleTokenId']>(null)
    const storedTokens = useSubscription(getStorage().addedTokens.subscription)

    const { value: nonFungibleTokenContract } = useNonFungibleTokenContract(pluginId, nonFungibleTokenAddress)

    useEffect(() => {
        setTipType(TipType.Token)
    }, [targetChainId])

    useEffect(() => {
        const selected = recipient && recipients.find((x) => x.address === recipient)
        if (selected || recipients.length === 0) return
        setRecipient(recipients[0].address)
    }, [recipient, recipients])

    useEffect(() => {
        if (!nativeTokenDetailed) return
        setToken(nativeTokenDetailed)
    }, [nativeTokenDetailed])
    const [gasConfig, setGasConfig] = useState<GasConfig | undefined>()
    const connectionOptions =
        pluginId === NetworkPluginID.PLUGIN_EVM
            ? {
                  overrides: gasConfig,
              }
            : undefined
    const tokenTipTuple = useTokenTip(pluginId, recipient, token, amount, connectionOptions)
    const nftTipTuple = useNftTip(pluginId, recipient, nonFungibleTokenId, nonFungibleTokenAddress, connectionOptions)

    const sendTipTuple = tipType === TipType.Token ? tokenTipTuple : nftTipTuple
    const isSending = sendTipTuple[0]
    const sendTip = sendTipTuple[1]

    const contextValue = useMemo(() => {
        const reset = () => {
            setAmount('')
            setNonFungibleTokenId(null)
            setNonFungibleTokenAddress('')
        }

        return {
            recipient,
            recipientSnsId: task.recipientSnsId || '',
            setRecipient,
            recipients,
            tipType,
            setTipType,
            token,
            setToken,
            amount,
            setAmount,
            nonFungibleTokenId,
            setNonFungibleTokenId,
            nonFungibleTokenContract: nonFungibleTokenContract || null,
            nonFungibleTokenAddress,
            setNonFungibleTokenAddress,
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
        recipients,
        tipType,
        amount,
        nonFungibleTokenId,
        nonFungibleTokenContract,
        nonFungibleTokenAddress,
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
