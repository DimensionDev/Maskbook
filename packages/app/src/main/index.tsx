import { lazy, Suspense } from 'react'
import { useAsyncRetry } from 'react-use'
import { DecryptError, DecryptErrorReasons } from '@masknet/encryption'
import type { TypedMessage } from '@masknet/typed-message'
import { RegistryContext, TypedMessageRender } from '@masknet/typed-message-react'
import { decrypt, parsePayloadBinary, parsePayloadText } from './decrypt.js'
import { registry } from '../typed-message-render/registry.js'
import { text } from './mockData.js'

const PluginRender = lazy(() => import('./plugin-render.js'))

export function DecryptUI() {
    const [error, isE2E, message] = useDecrypt(text)

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

function useDecrypt(text: string, version = '2') {
    const { value = [null, false, null] } = useAsyncRetry<
        [DecryptError | null, boolean, TypedMessage | null]
    >(async () => {
        const result = await main(version, text)

        if (typeof result === 'boolean')
            return [new DecryptError(DecryptErrorReasons.PayloadBroken, undefined), false, null]
        if (result instanceof DecryptError)
            return [result, result.message === DecryptErrorReasons.PrivateKeyNotFound, null]
        return [null, false, result]
    }, [version, text])

    return value
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
