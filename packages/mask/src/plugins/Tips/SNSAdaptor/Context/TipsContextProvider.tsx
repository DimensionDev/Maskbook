import { FC, useEffect, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useSubscription } from 'use-subscription'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    PluginIDContextProvider,
    PluginWeb3ContextProvider,
    useNativeToken,
    useNonFungibleToken,
    useNonFungibleTokenContract,
    useNonFungibleTokenOwnership,
    useTransferFungibleToken,
    useTransferNonFungibleToken,
} from '@masknet/plugin-infra/web3'
import { isSameAddress } from '@masknet/web3-shared-base'
import { getStorage } from '../../storage/index.js'
import { Task, AssetType } from '../../types/index.js'
import { PluginContext } from './index.js'
import { useRecipients } from '../hooks/useRecipients.js'
import { TipsContext } from './TipsContext.js'

export interface TipsContextProviderProps {
    task: Task
}

export const TipsContextProvider: FC<React.PropsWithChildren<TipsContextProviderProps>> = ({ children, task }) => {
    const { chainId, account, targetChainId, pluginID } = PluginContext.useContainer()
    const [recipient, setRecipient] = useState(task.recipient ?? '')
    const [assetType, setAssetType] = useState(AssetType.FungibleToken)
    const [amount, setAmount] = useState('')
    const [fungibleToken, setFungibleToken] = useState<Web3Helper.FungibleTokenScope<'all'> | null>(null)
    const [nonFungibleTokenId, setNonFungibleTokenId] = useState('')
    const [nonFungibleTokenAddress, setNonFungibleTokenAddress] = useState('')

    const recipients = useRecipients(task.recipients)
    const storedTokens = useSubscription(getStorage().addedTokens.subscription)
    const { value: nativeToken = null } = useNativeToken(pluginID, {
        chainId: targetChainId,
    })
    const { value: nonFungibleToken = null } = useNonFungibleToken(
        pluginID,
        nonFungibleTokenAddress,
        nonFungibleTokenId,
    )

    const { value: nonFungibleTokenContract = null } = useNonFungibleTokenContract(pluginID, nonFungibleTokenAddress)
    const { value: nonFungibleTokenOwnership = false } = useNonFungibleTokenOwnership(
        pluginID,
        nonFungibleTokenAddress,
        nonFungibleTokenId,
        account,
    )

    useEffect(() => {
        setAssetType(AssetType.FungibleToken)
    }, [targetChainId])

    useEffect(() => {
        const selected = !!recipients.find((x) => isSameAddress(x.address, recipient))
        if (selected || recipients.length === 0) return
        setRecipient(recipients[0].address)
    }, [recipient, recipients])

    useEffect(() => {
        if (!nativeToken) return
        setFungibleToken(nativeToken)
    }, [nativeToken])

    const transferFungibleToken = useTransferFungibleToken(pluginID, recipient, fungibleToken, amount)
    const transferNonFungibleToken = useTransferNonFungibleToken(
        pluginID,
        recipient,
        nonFungibleTokenId,
        nonFungibleTokenAddress,
    )

    const { value: transaction } =
        assetType === AssetType.FungibleToken ? transferFungibleToken : transferNonFungibleToken

    const [{ loading }, transferCallback] = useAsyncFn(async () => {
        return transaction?.confirm()
    }, [transaction])

    const contextValue = useMemo(() => {
        const resetCallback = () => {
            setAmount('')
            setNonFungibleTokenId('')
            setNonFungibleTokenAddress('')
        }

        return {
            recipient,
            setRecipient,
            recipientSnsId: task.recipientSnsId || '',
            recipients,
            assetType,
            setAssetType,
            fungibleToken,
            setFungibleToken,
            amount,
            setAmount,
            nonFungibleTokenId,
            setNonFungibleTokenId,
            nonFungibleTokenAddress,
            setNonFungibleTokenAddress,
            nonFungibleToken,
            nonFungibleTokenContract,
            nonFungibleTokenOwnership,
            transaction,
            loading,
            transferCallback,
            resetCallback,
            storedTokens: storedTokens.filter((t) => t.contract?.chainId === chainId),
        }
    }, [
        chainId,
        recipient,
        task.recipientSnsId,
        recipients,
        assetType,
        amount,
        nonFungibleTokenId,
        nonFungibleTokenContract,
        nonFungibleTokenAddress,
        fungibleToken,
        loading,
        transaction,
        storedTokens,
    ])
    return (
        <PluginIDContextProvider value={pluginID}>
            <PluginWeb3ContextProvider
                pluginID={pluginID}
                value={{
                    chainId: targetChainId,
                }}>
                <TipsContext.Provider value={contextValue}>{children}</TipsContext.Provider>
            </PluginWeb3ContextProvider>
        </PluginIDContextProvider>
    )
}
