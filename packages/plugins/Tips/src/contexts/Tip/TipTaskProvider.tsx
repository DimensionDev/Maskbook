import { memo, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { useSubscription } from 'use-subscription'
import { useNonFungibleTokenContract, useChainContext, useNativeToken } from '@masknet/web3-hooks-base'
import { isSameAddress, TokenType } from '@masknet/web3-shared-base'
import type { ChainId, GasConfig } from '@masknet/web3-shared-evm'
import { NetworkPluginID, type SocialAccount } from '@masknet/shared-base'
import { useAvailableBalance } from '@masknet/shared'
import type { Web3Helper } from '@masknet/web3-helpers'
import { getStorage } from '../../storage/index.js'
import type { TipTask } from '../../types/index.js'
import { type TipContextOptions, TipContext } from './TipContext.js'
import { useTipAccountsCompletion } from './useTipAccountsCompletion.js'
import { useNftTip } from './useNftTip.js'
import { useTokenTip } from './useTokenTip.js'
import { useRecipientValidate } from './useRecipientValidate.js'
import { useTipValidate } from './useTipValidate.js'
import { TargetRuntimeContext } from '../TargetRuntimeContext.js'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'

interface Props extends PropsWithChildren {
    task: TipTask
}

function useRecipients(pluginID: NetworkPluginID, tipsAccounts: Array<SocialAccount<Web3Helper.ChainIdAll>>) {
    const _recipients = useTipAccountsCompletion(tipsAccounts)
    const recipients = useMemo(() => {
        return [..._recipients].sort((a, z) => {
            if (a.pluginID === z.pluginID) return 0
            return a.pluginID === pluginID ? -1 : 1
        })
    }, [_recipients, pluginID])
    return recipients
}

export const TipTaskProvider = memo(({ children, task }: Props) => {
    const { targetPluginID, setTargetPluginID } = TargetRuntimeContext.useContainer()
    const { chainId: targetChainId, account } = useChainContext()

    const [gasOption, setGasOption] = useState<GasConfig>()
    const [_recipientAddress, setRecipient] = useState(task.recipient ?? '')
    const recipients = useRecipients(targetPluginID, task.accounts)
    const [tipType, setTipType] = useState(TokenType.Fungible)
    const [amount, setAmount] = useState('')
    const [nonFungibleTokenAddress, setNonFungibleTokenAddress] = useState('')
    const { data: nativeTokenDetailed = null } = useNativeToken(targetPluginID, { chainId: targetChainId })

    const [tokenMap, setTokenMap] = useState<Record<string, TipContextOptions['token']>>({})
    const key = `${targetPluginID}:${targetChainId}`
    const setToken: TipContextOptions['setToken'] = useCallback(
        (val) => {
            setTokenMap((map) => {
                const newToken = typeof val === 'function' ? val(map[key]) : val
                return { ...map, [key]: newToken }
            })
        },
        [key],
    )
    const token = tokenMap[key] ?? nativeTokenDetailed

    // #region balance
    const { isAvailableBalance, balance, isGasSufficient } = useAvailableBalance(
        targetPluginID,
        token?.address,
        gasOption,
        {
            chainId: targetChainId,
        },
    )
    // #endregion

    const [nonFungibleTokenId, setNonFungibleTokenId] = useState<TipContextOptions['nonFungibleTokenId']>(null)
    const storedTokens = useSubscription(getStorage().addedTokens.subscription)
    const validation = useTipValidate(targetPluginID, targetChainId, {
        tipType,
        amount,
        token,
        nonFungibleTokenId,
        nonFungibleTokenAddress,
        isGasSufficient,
    })

    const { value: nonFungibleTokenContract } = useNonFungibleTokenContract(targetPluginID, nonFungibleTokenAddress)

    const connectionOptions =
        targetPluginID === NetworkPluginID.PLUGIN_EVM ?
            {
                overrides: gasOption,
                chainId: targetChainId as ChainId,
            }
        :   undefined
    const recipientAddress = _recipientAddress || task.recipient || recipients[0]?.address
    const { loading: validatingRecipient, validation: recipientValidation } = useRecipientValidate(recipientAddress)
    const tokenTipTuple = useTokenTip(targetPluginID, recipientAddress, token, amount, connectionOptions)
    const nftTipTuple = useNftTip(
        targetPluginID,
        recipientAddress,
        nonFungibleTokenAddress,
        nonFungibleTokenId,
        connectionOptions,
    )

    const sendTipTuple = tipType === TokenType.Fungible ? tokenTipTuple : nftTipTuple
    const [isDirty, setIsDirty] = useState(false)
    useRenderPhraseCallbackOnDepsChange(() => {
        setIsDirty(true)
    }, [account, tipType, recipientAddress, targetChainId, amount, token])
    const isSending = sendTipTuple[0]
    const sendTip = sendTipTuple[1]
    const recipient = recipients.find((x) => isSameAddress(x.address, recipientAddress))

    const reset = useCallback(() => {
        setAmount('')
        setNonFungibleTokenId(null)
        setNonFungibleTokenAddress('')
    }, [])

    useRenderPhraseCallbackOnDepsChange(reset, [targetChainId])

    const wrappedSendTip = useCallback(() => {
        setIsDirty(false)
        return sendTip()
    }, [sendTip])

    const contextValue = useMemo((): TipContextOptions => {
        return {
            recipient,
            recipientUserId: task.recipientUserId || '',
            recipientAddress,
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
            sendTip: wrappedSendTip,
            // Respect to dirty status, reset if it's dirty
            isSending: isDirty ? false : isSending,
            isDirty,
            storedTokens: storedTokens.filter((t) => t.contract?.chainId === targetChainId),
            reset,
            gasOption,
            setGasOption,
            validation,
            validatingRecipient,
            recipientValidation,
            isAvailableBalance,
            isGasSufficient,
            balance,
        }
    }, [
        targetChainId,
        recipient,
        recipientAddress,
        task.recipient,
        task.recipientUserId,
        recipients,
        tipType,
        amount,
        nonFungibleTokenId,
        nonFungibleTokenContract,
        nonFungibleTokenAddress,
        token,
        wrappedSendTip,
        isSending,
        reset,
        balance,
        gasOption,
        storedTokens,
        validation,
        validatingRecipient,
        recipientValidation,
    ])

    useEffect(() => {
        const pid = recipient?.pluginID ?? NetworkPluginID.PLUGIN_EVM
        setTargetPluginID(pid)
    }, [recipient?.pluginID])

    return <TipContext value={contextValue}>{children}</TipContext>
})

TipTaskProvider.displayName = 'TipTaskProvider'

export function useTip() {
    return useContext(TipContext)
}
