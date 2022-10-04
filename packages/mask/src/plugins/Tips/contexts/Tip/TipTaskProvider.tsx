import { useChainId, useFungibleToken, useNonFungibleTokenContract } from '@masknet/plugin-infra/web3'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import type { GasOptionConfig } from '@masknet/web3-shared-evm'
import { FC, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSubscription } from 'use-subscription'
import { getStorage } from '../../storage/index.js'
import { TipTask, TipsType, TipsAccount } from '../../types/index.js'
import { TargetRuntimeContext } from '../TargetRuntimeContext.js'
import { TipContextOptions, TipContext } from './TipContext.js'
import { useTipAccountsCompletion } from './useTipAccountsCompletion.js'
import { useNftTip } from './useNftTip.js'
import { useTokenTip } from './useTokenTip.js'
import { useRecipientValidate } from './useRecipientValidate.js'
import { useTipValidate } from './useTipValidate.js'

interface Props {
    task: TipTask
}

function useRecipients(tipsAccounts: TipsAccount[], pluginId: NetworkPluginID) {
    const _recipients = useTipAccountsCompletion(tipsAccounts)
    const recipients = useMemo(() => {
        return [..._recipients].sort((a, z) => {
            if (a.pluginId === z.pluginId) return 0
            return a.pluginId === pluginId ? -1 : 1
        })
    }, [_recipients, pluginId])
    return recipients
}

export const TipTaskProvider: FC<React.PropsWithChildren<Props>> = memo(({ children, task }) => {
    const { targetChainId, pluginId, setPluginId } = TargetRuntimeContext.useContainer()
    const [_recipientAddress, setRecipient] = useState<string>(task.recipient ?? '')
    const recipients = useRecipients(task.addresses, pluginId)
    const [tipType, setTipType] = useState<TipsType>(TipsType.Tokens)
    const [amount, setAmount] = useState('')
    const chainId = useChainId()
    const [nonFungibleTokenAddress, setNonFungibleTokenAddress] = useState<string>('')
    const { value: nativeTokenDetailed = null } = useFungibleToken(pluginId, undefined, {
        chainId: targetChainId,
    })
    const [token, setToken] = useState<TipContextOptions['token']>(nativeTokenDetailed)
    const selectedToken = token ?? nativeTokenDetailed
    const [nonFungibleTokenId, setNonFungibleTokenId] = useState<TipContextOptions['nonFungibleTokenId']>(null)
    const storedTokens = useSubscription(getStorage().addedTokens.subscription)
    const validation = useTipValidate({ tipType, amount, token, nonFungibleTokenId, nonFungibleTokenAddress })

    const { value: nonFungibleTokenContract } = useNonFungibleTokenContract(pluginId, nonFungibleTokenAddress)

    const [gasOption, setGasOption] = useState<GasOptionConfig>()
    const connectionOptions =
        pluginId === NetworkPluginID.PLUGIN_EVM
            ? {
                  overrides: gasOption,
              }
            : undefined
    const recipientAddress = _recipientAddress || task.recipient || recipients[0]?.address
    const { loading: validatingRecipient, validation: recipientValidation } = useRecipientValidate(recipientAddress)
    const tokenTipTuple = useTokenTip(pluginId, recipientAddress, token, amount, connectionOptions)
    const nftTipTuple = useNftTip(
        pluginId,
        recipientAddress,
        nonFungibleTokenAddress,
        nonFungibleTokenId,
        connectionOptions,
    )

    const sendTipTuple = tipType === TipsType.Tokens ? tokenTipTuple : nftTipTuple
    const isSending = sendTipTuple[0]
    const sendTip = sendTipTuple[1]
    const recipient = recipients.find((x) => isSameAddress(x.address, recipientAddress))

    const reset = useCallback(() => {
        setAmount('')
        setNonFungibleTokenId(null)
        setNonFungibleTokenAddress('')
    }, [])

    useEffect(reset, [targetChainId])

    const contextValue = useMemo(() => {
        return {
            recipient,
            recipientSnsId: task.recipientSnsId || '',
            recipientAddress,
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
            validation,
            validatingRecipient,
            recipientValidation,
        }
    }, [
        chainId,
        recipient,
        recipientAddress,
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
        reset,
        gasOption,
        storedTokens,
        validation,
        validatingRecipient,
        recipientValidation,
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
})

export function useTip() {
    return useContext(TipContext)
}
