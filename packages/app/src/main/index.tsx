import { Suspense, lazy, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { Typography } from '@mui/material'
import { DecryptError, DecryptErrorReasons } from '@masknet/encryption'
import type { TypedMessage } from '@masknet/typed-message'
import { decrypt, parsePayloadBinary, parsePayloadText } from './decrypt.js'

const PluginRender = lazy(() => import('./plugin-render.js'))
const PageInspectorRender = lazy(() => import('./page-render.js'))

export function DecryptUI() {
    const postData = usePostData()
    if (!postData) return <Typography>No payload found.</Typography>

    const [text, version] = postData
    return <UI text={text} version={version} />
}

function UI(props: { text: string; version: string }) {
    const { text, version } = props
    const [error, isE2E, message] = useDecrypt(text, version)

    if (isE2E) return <Typography>This message is a e2e encrypted message. We can not decrypt it here.</Typography>
    if (error) return <Typography>We encountered an error when try to decrypt this message: {error.message}</Typography>
    if (!message) return <Typography>Decrypting...</Typography>
    return (
        <Suspense>
            <PluginRender message={message} />
            <PageInspectorRender />
        </Suspense>
    )
}

function usePostData() {
    return useMemo(() => {
        const params = new URLSearchParams(location.search)
        if (params.has('PostData_v2')) return [params.get('PostData_v2')!, '2'] as const
        if (params.has('PostData_v1')) return [params.get('PostData_v1')!, '1'] as const
        return
    }, [])
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
