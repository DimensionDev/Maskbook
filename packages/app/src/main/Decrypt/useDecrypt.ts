import { useAsyncRetry } from 'react-use'
import { DecryptError, DecryptErrorReasons } from '@masknet/encryption'
import type { TypedMessage } from '@masknet/typed-message'
import { decrypt, parsePayloadBinary, parsePayloadText } from './decrypt.js'

type DecryptResult = [DecryptError | null, boolean, TypedMessage | null]
export function useDecrypt(text: string, version = '2') {
    const { value = [null, false, null] } = useAsyncRetry<DecryptResult>(async () => {
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
