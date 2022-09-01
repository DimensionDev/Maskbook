import { useChainId, useFungibleToken, useNonFungibleTokenContract } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { GasOptionConfig } from '@masknet/web3-shared-evm'
import { FC, useContext, useEffect, useMemo, useState } from 'react'
import { useSubscription } from 'use-subscription'
import { getStorage } from '../../storage/index.js'
import { TipTask, TipsType } from '../../types/index.js'
import { TargetRuntimeContext } from '../TargetRuntimeContext.js'
import { ContextOptions, TipContext } from './TipContext.js'
import { useTipAccountsCompletion } from './useTipAccountsCompletion.js'
import { useNftTip } from './useNftTip.js'
import { useTokenTip } from './useTokenTip.js'

interface Props {
    task: TipTask
}

export const TipTaskProvider: FC<React.PropsWithChildren<Props>> = ({ children, task }) => {
    const { targetChainId, pluginId, setPluginId } = TargetRuntimeContext.useContainer()
    const [recipientAddress, setRecipient] = useState<string>(task.recipient ?? '')
    const recipients = useTipAccountsCompletion(task.addresses)
    const [tipType, setTipType] = useState<TipsType>(TipsType.Tokens)
    const [amount, setAmount] = useState('')
    const chainId = useChainId()
    const [nonFungibleTokenAddress, setNonFungibleTokenAddress] = useState<string>('')
    const { value: nativeTokenDetailed = null } = useFungibleToken(pluginId, undefined, {
        chainId: targetChainId,
    })
    const [token, setToken] = useState<ContextOptions['token']>(nativeTokenDetailed)
    const selectedToken = token ?? nativeTokenDetailed
    const [nonFungibleTokenId, setNonFungibleTokenId] = useState<ContextOptions['nonFungibleTokenId']>(null)
    const storedTokens = useSubscription(getStorage().addedTokens.subscription)

    const { value: nonFungibleTokenContract } = useNonFungibleTokenContract(pluginId, nonFungibleTokenAddress)

    useEffect(() => {
        setTipType(TipsType.Tokens)
    }, [targetChainId])

    const [gasOption, setGasOption] = useState<GasOptionConfig>()
    const connectionOptions =
        pluginId === NetworkPluginID.PLUGIN_EVM
            ? {
                  overrides: gasOption,
              }
            : undefined
    const selectedRecipientAddress = recipientAddress || task.recipient || recipients[0]?.address
    const tokenTipTuple = useTokenTip(pluginId, selectedRecipientAddress, token, amount, connectionOptions)
    const nftTipTuple = useNftTip(
        pluginId,
        selectedRecipientAddress,
        nonFungibleTokenId,
        nonFungibleTokenAddress,
        connectionOptions,
    )

    const sendTipTuple = tipType === TipsType.Tokens ? tokenTipTuple : nftTipTuple
    const isSending = sendTipTuple[0]
    const sendTip = sendTipTuple[1]
    const recipient = recipients.find((x) => x.address === selectedRecipientAddress)

    const contextValue = useMemo(() => {
        const reset = () => {
            setAmount('')
            setNonFungibleTokenId(null)
            setNonFungibleTokenAddress('')
        }

        return {
            recipient,
            recipientSnsId: task.recipientSnsId || '',
            recipientAddress: selectedRecipientAddress,
            setRecipient,
            recipients,
            tipType,
            setTipType,
            token: selectedToken,
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
            gasOption,
            setGasOption,
        }
    }, [
        chainId,
        recipient,
        selectedRecipientAddress,
        task.recipient,
        task.recipientSnsId,
        recipients,
        tipType,
        amount,
        nonFungibleTokenId,
        nonFungibleTokenContract,
        nonFungibleTokenAddress,
        selectedToken,
        sendTip,
        isSending,
        gasOption,
        storedTokens,
    ])

    useEffect(() => {
        if (recipient?.pluginId) {
            setPluginId(recipient.pluginId)
        } else {
            setPluginId(NetworkPluginID.PLUGIN_EVM)
        }
    }, [recipient?.pluginId])

    useEffect(() => {
        setToken(nativeTokenDetailed)
    }, [nativeTokenDetailed])

    return <TipContext.Provider value={contextValue}>{children}</TipContext.Provider>
}

export function useTip() {
    return useContext(TipContext)
}
