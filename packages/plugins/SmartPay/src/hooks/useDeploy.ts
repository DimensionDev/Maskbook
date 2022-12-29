import { useAsyncFn } from 'react-use'
import { useLastRecognizedIdentity, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { NetworkPluginID, PersonaInformation } from '@masknet/shared-base'
import { useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import type { AbstractAccountAPI } from '@masknet/web3-providers/types'
import { ProviderType, ChainId } from '@masknet/web3-shared-evm'
import type { ManagerAccount } from '../type.js'
import type { Wallet } from '@masknet/web3-shared-base'
import getUnixTime from 'date-fns/getUnixTime'
import { SmartPayFunder } from '@masknet/web3-providers'

export function useDeploy(
    signPersona?: PersonaInformation,
    signWallet?: Wallet,
    signAccount?: ManagerAccount,
    contractAccount?: AbstractAccountAPI.AbstractAccount<NetworkPluginID.PLUGIN_EVM>,
    nonce?: number,
    onSuccess?: () => void,
) {
    const { Wallet } = useWeb3State()
    const { signWithPersona } = useSNSAdaptorContext()
    const lastRecognizedIdentity = useLastRecognizedIdentity()

    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, {
        providerType: ProviderType.MaskWallet,
        chainId: ChainId.Mumbai,
    })

    return useAsyncFn(async () => {
        if (
            !lastRecognizedIdentity?.identifier?.userId ||
            !signAccount?.address ||
            !contractAccount ||
            (!signPersona && !signWallet)
        )
            return

        // TODO: replace to signer
        const payload = JSON.stringify({
            twitterHandler: lastRecognizedIdentity.identifier.userId,
            ts: getUnixTime(new Date()),
            // publicKey: currentPersona?.identifier.publicKeyAsHex,
            nonce,
        })

        let signature: string | undefined

        if (signPersona) {
            signature = (
                await signWithPersona({
                    method: 'message',
                    message: payload,
                    identifier: signPersona.identifier,
                })
            ).signature
        } else if (signWallet) {
            signature = await connection?.signMessage(payload, 'personalSign', {
                account: signWallet.address,
                providerType: ProviderType.MaskWallet,
            })
        }
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
    }, [
        connection,
        signAccount,
        lastRecognizedIdentity?.identifier,
        signWallet,
        signPersona,
        contractAccount,
        nonce,
        onSuccess,
    ])
}
