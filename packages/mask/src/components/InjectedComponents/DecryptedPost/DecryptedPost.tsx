import { useEffect, useMemo, useState } from 'react'
import {
    TypedMessageTuple,
    ProfileIdentifier,
    extractTextFromTypedMessage,
    extractImageFromTypedMessage,
} from '@masknet/shared-base'

import type { Profile } from '../../../database'
import { usePostInfoDetails } from '@masknet/plugin-infra'
import { ServicesWithProgress } from '../../../extension/service'
import {
    DecryptError,
    DecryptProgress,
    DecryptProgressKind,
    DecryptSuccess,
    SocialNetworkEnum,
} from '@masknet/encryption'
import type { DecryptionInfo, SocialNetworkEncodedPayload } from '../../../../background/services/crypto/decryption'
import { DecryptPostSuccess } from './DecryptedPostSuccess'
import type { DecryptIntermediateProgress } from '@masknet/encryption/src/encryption'
import { DecryptPostAwaiting } from './DecryptPostAwaiting'
import { DecryptPostFailed } from './DecryptPostFailed'
import draft from 'immer'

export interface DecryptPostProps {
    onDecrypted: (post: TypedMessageTuple) => void
    whoAmI: ProfileIdentifier
    profiles: Profile[]
    alreadySelectedPreviously: Profile[]
    requestAppendRecipients?(to: Profile[]): Promise<void>
}
export function DecryptPost(props: DecryptPostProps) {
    const { whoAmI } = props
    const decryptions = useDecryption(whoAmI)
    const jsx = Object.entries(decryptions).map(([key, value]) => {
        const isExplicit = value.some((x) => x.type === DecryptProgressKind.Info && x.iv)
        const result = value.find(isDecryptSuccess)
        if (!isExplicit && !result) return null

        if (result) {
            return (
                <DecryptPostSuccess key={key} alreadySelectedPreviously={[]} data={result} profiles={[]} sharedPublic />
            )
        }
        const failed = value.find(isDecryptError)
        if (failed) return <DecryptPostFailed key={key} error={failed} />
        const process = value.find(isDecryptProgress)
        if (process) return <DecryptPostAwaiting key={key} progress={process} />

        return null
    })
    return <>{jsx}</>
}

function useSocialNetworkEncodedPayload(): SocialNetworkEncodedPayload[] {
    const message = usePostInfoDetails.rawMessageResolved()
    const mentionedLinks = usePostInfoDetails.mentionedLinks()
    return useMemo(() => {
        const text = extractTextFromTypedMessage(message)
        const images = extractImageFromTypedMessage(message)
        const payloads: SocialNetworkEncodedPayload[] = []
        if (text.ok && text.val.length > 10) payloads.push({ type: 'text', text: text.val })
        for (const text of mentionedLinks) payloads.push({ type: 'text', text })
        for (const image of images) if (typeof image === 'string') payloads.push({ type: 'image-url', url: image })
        return payloads
    }, [message, mentionedLinks.join(' ')])
}

function useDecryption(whoAmI: ProfileIdentifier) {
    const payloads = useSocialNetworkEncodedPayload()
    const author = usePostInfoDetails.author()
    const url = usePostInfoDetails.url()?.toString()
    const [decryptions, _setDecryption] = useState<Record<string, (DecryptProgress | DecryptionInfo)[]>>({})
    function setDecryption(f: (val: typeof decryptions) => void) {
        _setDecryption((val) => draft(val, f))
    }

    useEffect(() => {
        const abort = new AbortController()
        async function main() {
            const process = ServicesWithProgress.decryptionWithSocialNetworkDecoding(payloads, {
                authorHint: author,
                currentProfile: whoAmI,
                currentSocialNetwork: SocialNetworkEnum.Twitter,
                postURL: url,
            })
            const currentPassIDs = new Set<string>()
            abort.signal.addEventListener('abort', () => {
                setDecryption((val) => {
                    for (const id of currentPassIDs) delete val[id]
                })
            })
            for await (const [id, item] of process) {
                if (abort.signal.aborted) return
                currentPassIDs.add(id)
                setDecryption((val) => {
                    val[id] ||= []
                    val[id] = [item, ...val[id]]
                })
            }
        }
        main()

        return () => abort.abort()
    }, [payloads, author.toText(), whoAmI.toText(), url])

    return decryptions
}

function isDecryptSuccess(value: DecryptProgress | DecryptionInfo): value is DecryptSuccess {
    return value.type === DecryptProgressKind.Success
}

function isDecryptError(value: DecryptProgress | DecryptionInfo): value is DecryptError {
    return value.type === DecryptProgressKind.Error
}

function isDecryptProgress(value: DecryptProgress | DecryptionInfo): value is DecryptIntermediateProgress {
    return value.type === DecryptProgressKind.Progress
}
