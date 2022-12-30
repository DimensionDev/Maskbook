import { useAsync, useAsyncFn } from 'react-use'
import { useLastRecognizedIdentity, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { NetworkPluginID, PersonaInformation, SignType } from '@masknet/shared-base'
import { useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import { AbstractAccountAPI, FunderAPI } from '@masknet/web3-providers/types'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { ManagerAccount } from '../type.js'
import type { Wallet } from '@masknet/web3-shared-base'
import getUnixTime from 'date-fns/getUnixTime'
import { SmartPayBundler, SmartPayFunder } from '@masknet/web3-providers'

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
    const { value: chainId } = useAsync(SmartPayBundler.getSupportedChainId, [])

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
            type: signPersona ? FunderAPI.ProofType.Persona : FunderAPI.ProofType.EOA,
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
