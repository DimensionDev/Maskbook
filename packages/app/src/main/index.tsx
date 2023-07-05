import { Suspense, lazy } from 'react'
import { Typography } from '@mui/material'
import { RegistryContext, TypedMessageRender } from '@masknet/typed-message-react'
import { registry } from './TypedMessageRender/registry.js'
import { useDecrypt } from './Decrypt/useDecrypt.js'

const PluginRender = lazy(() => import('./plugin-render.js'))
const PageInspectorRender = lazy(() => import('./page-render.js'))

export function DecryptMessage() {
    const postData = usePostData()
    if (!postData) return <Typography>No payload found.</Typography>

    const [text, version] = postData
    return <DecryptMessageWorker text={text} version={version} />
}

function DecryptMessageWorker(props: { text: string; version: string }) {
    const { text, version } = props
    const [error, isE2E, message] = useDecrypt(text, version)

    if (isE2E)
        return (
            <Typography>
                This message is a e2e encrypted message. You can only decrypt this message when it is encrypted to you
                and decrypt it with Mask Network extension.
            </Typography>
        )
    if (error)
        return (
            <Typography>
                We encountered an error when try to decrypt this message: <br />
                {error.message}
            </Typography>
        )
    if (!message) return <Typography>Decrypting...</Typography>
    return (
        <RegistryContext.Provider value={registry.getTypedMessageRender}>
            <TypedMessageRender message={message} />
            <Suspense fallback={<Typography>Plugin is loading...</Typography>}>
                <PluginRender message={message} />
                <PageInspectorRender />
            </Suspense>
        </RegistryContext.Provider>
    )
}

function usePostData() {
    const params = new URLSearchParams(location.search)
    if (params.has('PostData_v2')) return [params.get('PostData_v2')!, '2'] as const
    if (params.has('PostData_v1')) return [params.get('PostData_v1')!, '1'] as const
    return
}
