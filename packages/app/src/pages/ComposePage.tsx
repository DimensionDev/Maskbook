import { useCallback, useMemo } from 'react'
import { None } from 'ts-results-es'
import { CompositionDialogUI, ShareSelectNetworkModal } from '@masknet/shared'
import { encrypt } from '@masknet/encryption'
import { PostInfoContext } from '@masknet/plugin-infra/content-script'
import type { SerializableTypedMessages } from '@masknet/typed-message'
import { PageContainer } from '../components/PageContainer.js'
import { getPostPayload } from '../helpers/getPostPayload.js'
import { createPostInfoContext } from '../helpers/createPostInfoContext.js'
import { DecryptMessage } from '../main/DecryptMessage.js'

export interface ComposePageProps {}

async function throws(): Promise<never> {
    throw new Error('Unreachable')
}

export default function ComposePage(props: ComposePageProps) {
    const payload = getPostPayload()
    const context = useMemo(() => createPostInfoContext(), [])

    const onSubmit = useCallback(async (data: SerializableTypedMessages) => {
        const encrypted = await encrypt(
            {
                author: None,
                authorPublicKey: None,
                message: data,
                network: '',
                target: { type: 'public' },
                version: -37,
            },
            { deriveAESKey: throws, encryptByLocalKey: throws },
        )
        ShareSelectNetworkModal.open({
            message: encrypted.output as Uint8Array,
        })
    }, [])

    if (payload) {
        return (
            <PageContainer title="Decrypted Post">
                <PostInfoContext.Provider value={context}>
                    <DecryptMessage text={payload[0]} version={payload[1]} />
                </PostInfoContext.Provider>
            </PageContainer>
        )
    }

    return (
        <PageContainer title="Encrypted Post">
            <CompositionDialogUI maxLength={560} onSubmit={onSubmit} />
        </PageContainer>
    )
}
