import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'
import { CompositionDialogUI, ShareSelectNetworkModal } from '@masknet/shared'
import { useCallback } from 'react'
import { encrypt } from '@masknet/encryption'
import { None } from 'ts-results-es'
import type { SerializableTypedMessages } from '@masknet/typed-message'

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
        <DashboardContainer>
            <main>
                <DashboardHeader title="Encrypted Post" />

                <div className="bg-white p-5">
                    <div className="border overflow-hidden rounded-lg">
                        <DisableShadowRootContext.Provider value={false}>
                            <ShadowRootIsolation>
                                <CompositionDialogUI maxLength={560} onSubmit={onSubmit} />
                            </ShadowRootIsolation>
                        </DisableShadowRootContext.Provider>
                    </div>
                </div>
            </main>
        </DashboardContainer>
    )
}
