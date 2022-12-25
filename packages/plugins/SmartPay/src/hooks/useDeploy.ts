import { useAsyncFn } from 'react-use'
import getUnixTime from 'date-fns/getUnixTime'
import {
    useLastRecognizedIdentity,
    useCurrentPersonaInformation,
    useSNSAdaptorContext,
} from '@masknet/plugin-infra/content-script'
import { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import { SmartPayFunder } from '@masknet/web3-providers'
import type { ContractAccountAPI } from '@masknet/web3-providers/types'
import { ProviderType, ChainId } from '@masknet/web3-shared-evm'
import { SignAccount, SignAccountType } from '../type.js'

export function useDeploy(
    signAccount?: SignAccount,
    contractAccount?: ContractAccountAPI.ContractAccount<NetworkPluginID.PLUGIN_EVM>,
    nonce?: number,
    onSuccess?: () => void,
) {
    const { Wallet } = useWeb3State()
    const { signMessageWithPersona } = useSNSAdaptorContext()
    const currentPersona = useCurrentPersonaInformation()
    const lastRecognizedIdentity = useLastRecognizedIdentity()

    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, {
        providerType: ProviderType.MaskWallet,
        chainId: ChainId.Mumbai,
    })

    return useAsyncFn(async () => {
        if (!lastRecognizedIdentity?.identifier?.userId || !currentPersona || !signAccount?.address || !contractAccount)
            return

        const payload = JSON.stringify({
            twitterHandler: lastRecognizedIdentity.identifier.userId,
            ts: getUnixTime(new Date()),
            publicKey: currentPersona?.identifier.publicKeyAsHex,
            nonce,
        })

        let signature: string

        if (signAccount.type === SignAccountType.Persona && signAccount?.raw?.identifier) {
            signature = (
                await signMessageWithPersona({
                    method: 'eth',
                    message: payload,
                    identifier: signAccount.raw.identifier,
                })
            ).signature
        } else if (signAccount.type === SignAccountType.Wallet) {
            signature = (await connection?.signMessage(payload, 'personalSign', {
                account: signAccount.address,
                providerType: ProviderType.MaskWallet,
            })) as string
        } else return

        if (!signature) return

        const response = await SmartPayFunder.fund(ChainId.Mumbai, {
            ownerAddress: signAccount.address,
            signature,
            payload,
        })

        if (response.message.walletAddress && onSuccess) {
            Wallet?.updateWallet(contractAccount.address, {
                name: 'Smart Pay',
            })
            onSuccess()
        }
    }, [connection, signAccount, lastRecognizedIdentity?.identifier, currentPersona, contractAccount, nonce, onSuccess])
}
