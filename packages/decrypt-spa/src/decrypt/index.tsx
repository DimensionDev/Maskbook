import { DecryptError, DecryptErrorReasons, encrypt } from '@masknet/encryption'
import { makeTypedMessageText, TypedMessage } from '@masknet/typed-message'
import { useEffect, useState } from 'react'
import { decrypt, parsePayloadBinary, parsePayloadText } from './decrypt.js'
import { createTypedMessageRenderRegistry, RegistryContext, TypedMessageRender } from '@masknet/typed-message-react'
import { encodeArrayBuffer } from '@masknet/kit'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { NetworkContextProvider } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

const registry = createTypedMessageRenderRegistry()

const Decrypted = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useAnyMode,
    (x) => x.DecryptedInspector,
)
export default function Decryption() {
    const [error, isE2E, message] = useDecryption()
    if (isE2E) {
        return (
            <>This message is a end-to-end encrypted message. We does not have enough information to decrypt it here.</>
        )
    }
    if (error) {
        console.error(error)
        return <>We encountered an error when try to decrypt this message: {error.message}</>
    }
    if (!message) return <>Decrypting...</>
    return (
        <>
            Decrypted message:
            <RegistryContext.Provider value={registry.getTypedMessageRender}>
                <TypedMessageRender message={message} />
            </RegistryContext.Provider>
            <NetworkContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                <Decrypted message={message} />
            </NetworkContextProvider>
        </>
    )
}

const text = encodeURIComponent(
    encodeArrayBuffer(
        (
            await encrypt(
                {
                    message: makeTypedMessageText(
                        'https://gitcoin.co/grants/159/mask-network-the-portal-to-the-new-open-internet-',
                    ),
                    network: '',
                    target: {
                        type: 'public',
                    },
                    version: -37,
                },
                {
                    deriveAESKey: null!,
                    encryptByLocalKey: null!,
                    async queryPublicKey() {
                        return null
                    },
                },
            )
        ).output as ArrayBuffer,
    ),
)

function useDecryption() {
    const [message, setMessage] = useState<TypedMessage | null>(null)
    const [isE2E, setIsE2E] = useState<boolean>(false)
    const [error, setError] = useState<DecryptError | null>(null)
    useEffect(() => {
        main('2', text).then((result) => {
            if (typeof result === 'boolean')
                return setError(new DecryptError(DecryptErrorReasons.PayloadBroken, undefined))
            else if (result instanceof DecryptError) {
                if (result.message === DecryptErrorReasons.PrivateKeyNotFound) setIsE2E(true)
                else setError(result)
            } else setMessage(result)
        })
    }, [])

    return [error, isE2E, message] as const
}

/**
 * @returns false: does not contain valid payload
 */
async function main(version: string, data: string): Promise<false | TypedMessage | DecryptError> {
    if (version !== '1' && version !== '2') return false

    const payload = version === '1' ? await parsePayloadText(data) : await parsePayloadBinary(data)
    if (!payload) return false

    if (payload.encryption.ok && payload.encryption.val.type === 'E2E')
        return new DecryptError(DecryptErrorReasons.PrivateKeyNotFound, undefined)

    return decrypt(data, payload)
}
