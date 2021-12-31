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
            const m = flattenTypedMessage(await waitTypedMessage(raw))
            const t = extractTextFromTypedMessage(m).unwrapOr('')
            const i = extractImageFromTypedMessage(m).filter((x): x is string => typeof x === 'string')
            console.log(m, t, i)
            const x: SocialNetworkEncodedPayload = i.length
                ? { type: 'image-url', url: i.at(0)! }
                : { type: 'text', text: t }
            const process = ServicesWithProgress.decryptionWithSocialNetworkDecoding(x, {
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
