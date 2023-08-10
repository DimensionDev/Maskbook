import { CompositionDialogUI, ShareSelectNetworkModal } from '@masknet/shared'
import { useCallback } from 'react'
import { encrypt } from '@masknet/encryption'
import { None } from 'ts-results-es'
import type { SerializableTypedMessages } from '@masknet/typed-message'
import { PageContainer } from '../components/PageContainer.js'

export interface ComposePageProps {}
async function throws(): Promise<never> {
    throw new Error('Unreachable')
}
export default function ComposePage(props: ComposePageProps) {
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

    return (
        <PageContainer title="Encrypted Post">
            <CompositionDialogUI maxLength={560} onSubmit={onSubmit} />
        </PageContainer>
    )
}
