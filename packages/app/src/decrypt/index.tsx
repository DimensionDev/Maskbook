import { lazy, Suspense, useEffect, useState } from 'react'
import { DecryptError, DecryptErrorReasons } from '@masknet/encryption'
import type { TypedMessage } from '@masknet/typed-message'
import { RegistryContext, TypedMessageRender } from '@masknet/typed-message-react'
import { decrypt, parsePayloadBinary, parsePayloadText } from './decrypt.js'
import { registry } from '../typed-message-render/registry.js'
import { text } from './mockData.js'

const PluginRender = lazy(() => import('./plugin-render.js'))

export function DecryptUI() {
    const [error, isE2E, message] = useDecryption()
    if (isE2E) {
        return <>This message is a end-to-end encrypted message. We can not decrypt it here.</>
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
            <Suspense>
                {/* Do not add React context here. Add it in ./plugin-render */}
                <PluginRender message={message} />
            </Suspense>
        </>
    )
}

function useDecryption() {
    const [message, setMessage] = useState<TypedMessage | null>(null)
    const [isE2E, setIsE2E] = useState<boolean>(false)
    const [error, setError] = useState<DecryptError | null>(null)
    const version = '2'
    useEffect(() => {
        main(version, text).then((result) => {
            if (typeof result === 'boolean')
                return setError(new DecryptError(DecryptErrorReasons.PayloadBroken, undefined))
            else if (result instanceof DecryptError) {
                if (result.message === DecryptErrorReasons.PrivateKeyNotFound) setIsE2E(true)
                else setError(result)
            } else setMessage(result)
        })
    }, [version, text])

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
