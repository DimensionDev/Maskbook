import { useEffect } from 'react'
import {
    TypedMessageTuple,
    ProfileIdentifier,
    extractTextFromTypedMessage,
    waitTypedMessage,
    flattenTypedMessage,
    extractImageFromTypedMessage,
} from '@masknet/shared-base'

import type { Profile } from '../../../database'
import { usePostInfoDetails } from '@masknet/plugin-infra'
import { ServicesWithProgress } from '../../../extension/service'
import { SocialNetworkEnum } from '@masknet/encryption'
import type { SocialNetworkEncodedPayload } from '../../../../background/services/crypto/decryption'

export interface DecryptPostProps {
    onDecrypted: (post: TypedMessageTuple) => void
    whoAmI: ProfileIdentifier
    profiles: Profile[]
    alreadySelectedPreviously: Profile[]
    requestAppendRecipients?(to: Profile[]): Promise<void>
}
export function DecryptPost(props: DecryptPostProps) {
    const { whoAmI } = props
    const raw = usePostInfoDetails.rawMessage()
    const author = usePostInfoDetails.author()
    const url = usePostInfoDetails.url()

    useEffect(() => {
        const abort = new AbortController()
        async function main() {
            const message = flattenTypedMessage(await waitTypedMessage(raw))
            const text = extractTextFromTypedMessage(message).unwrapOr('')
            const images = extractImageFromTypedMessage(message).filter((x): x is string => typeof x === 'string')
            const payloads: SocialNetworkEncodedPayload[] = []
            payloads.push({ type: 'text', text })
            payloads.push(...images.map<SocialNetworkEncodedPayload>((url) => ({ type: 'image-url', url })))
            const process = ServicesWithProgress.decryptionWithSocialNetworkDecoding(payloads, {
                authorHint: author,
                currentProfile: whoAmI,
                currentSocialNetwork: SocialNetworkEnum.Twitter,
                postURL: url?.toString(),
            })
            for await (const x of process) {
                if (abort.signal.aborted) return
                console.log(x, 1)
            }
        }
        main()

        return () => abort.abort()
    })

    return <>In progress...</>
}
