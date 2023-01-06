import { useAsyncFn } from 'react-use'
import getUnixTime from 'date-fns/getUnixTime'
import { useLastRecognizedIdentity, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { NetworkPluginID, PersonaInformation, ProofType, SignType } from '@masknet/shared-base'
import { useChainContext, useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import type { AbstractAccountAPI } from '@masknet/web3-providers/types'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { Wallet } from '@masknet/web3-shared-base'
import { SmartPayFunder } from '@masknet/web3-providers'
import type { ManagerAccount } from '../type.js'

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
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, {
        providerType: ProviderType.MaskWallet,
        chainId,
    })

    return useAsyncFn(async () => {
        if (
            !chainId ||
            !lastRecognizedIdentity?.identifier?.userId ||
            !signAccount?.address ||
            !contractAccount ||
            (!signPersona && !signWallet)
        )
            return

        const payload = JSON.stringify({
            twitterHandler: lastRecognizedIdentity.identifier.userId,
            ts: getUnixTime(new Date()),
            ownerAddress: signAccount.address,
            nonce,
        })

        let signature: string | undefined

        if (signPersona) {
            signature = await signWithPersona(SignType.Message, payload, signPersona.identifier)
        } else if (signWallet) {
            signature = await connection?.signMessage(payload, 'personalSign', {
                account: signWallet.address,
                providerType: ProviderType.MaskWallet,
            })
        }
        const publicKey = signPersona ? signPersona.identifier.publicKeyAsHex : signWallet?.address
        if (!signature || !publicKey) return

        const response = await SmartPayFunder.fund(chainId, {
            publicKey,
            type: signPersona ? ProofType.Persona : ProofType.EOA,
            signature,
            payload,
        })

        if (response.message.walletAddress && onSuccess) {
            await Wallet?.updateWallet(contractAccount.address, {
                name: 'Smart Pay',
            })
            onSuccess()
        }
    }, [
        chainId,
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
