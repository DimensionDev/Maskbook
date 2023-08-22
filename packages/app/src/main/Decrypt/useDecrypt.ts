import { useAsyncRetry } from 'react-use'
import { DecryptError, DecryptErrorReasons, type PayloadParseResult } from '@masknet/encryption'
import type { TypedMessage } from '@masknet/typed-message'
import { decrypt, parsePayloadBinary, parsePayloadText } from './decrypt.js'

type DecryptResult = [DecryptError | null, boolean, TypedMessage | null, PayloadParseResult.Payload | null]

export function useDecrypt(text: string, version = '2') {
    const { value = [null, false, null] } = useAsyncRetry<DecryptResult>(async () => {
        const payload = version === '1' ? await parsePayloadText(text) : await parsePayloadBinary(text)
        if (!payload) return [new DecryptError(DecryptErrorReasons.PayloadBroken, undefined), false, null, null]

        if (payload.encryption.ok && payload.encryption.val.type === 'E2E') {
            const result = new DecryptError(DecryptErrorReasons.PrivateKeyNotFound, undefined)
            return [result, result.message === DecryptErrorReasons.PrivateKeyNotFound, null, payload]
        }

        return [null, false, await decrypt(text, payload), payload]
    }, [version, text])

    return value
}
