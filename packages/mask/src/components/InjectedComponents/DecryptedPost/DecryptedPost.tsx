import { MaskPayloadContext, usePostInfoDetails } from '@masknet/plugin-infra'
import { DecryptError, DecryptProgress, DecryptProgressKind, DecryptSuccess } from '@masknet/encryption'
import type { DecryptionInfo } from '../../../../background/services/crypto/decryption'
import { DecryptPostSuccess } from './DecryptedPostSuccess'
import type { DecryptIntermediateProgress } from '@masknet/encryption/src/encryption'
import { DecryptPostAwaiting } from './DecryptPostAwaiting'
import { DecryptPostFailed } from './DecryptPostFailed'
import { useSubscription } from 'use-subscription'
import { findLast } from 'lodash-unified'

export interface DecryptedPostsProps {}
export function DecryptedPosts(props: DecryptedPostsProps) {
    const decryptions = usePostInfoDetails.maskPayloads()
    return (
        <>
            {decryptions.map((context) => (
                <DecryptedPost {...context} key={context.id} />
            ))}
        </>
    )
}

function DecryptedPost(props: MaskPayloadContext) {
    const decryption = useSubscription(props.decrypted)
    const publicShared = useSubscription(props.publicShared)

    const success = findLast(decryption, isDecryptSuccess)
    if (success) {
        return (
            <DecryptPostSuccess
                data={success}
                // TODO:
                alreadySelectedPreviously={[]}
                profiles={[]}
                sharedPublic={publicShared}
            />
        )
    }
    const failed = findLast(decryption, isDecryptError)
    if (failed) return <DecryptPostFailed error={failed} />
    const progress = findLast(decryption, isDecryptProgress)
    if (progress) return <DecryptPostAwaiting progress={progress} />
    return null
}

// function useSocialNetworkEncodedPayload(): SocialNetworkEncodedPayload[] {
//     const message = usePostInfoDetails.rawMessageResolved()
//     const mentionedLinks = usePostInfoDetails.mentionedLinks()
//     return useMemo(() => {
//         const text = extractTextFromTypedMessage(message)
//         const images = extractImageFromTypedMessage(message)
//         const payloads: SocialNetworkEncodedPayload[] = []
//         if (text.ok && text.val.length > 10) payloads.push({ type: 'text', text: text.val })
//         for (const text of mentionedLinks) payloads.push({ type: 'text', text })
//         for (const image of images) if (typeof image === 'string') payloads.push({ type: 'image-url', url: image })
//         return payloads
//     }, [message, mentionedLinks.join(' ')])
// }

// function useDecryption(whoAmI: ProfileIdentifier) {
//     const payloads = useSocialNetworkEncodedPayload()
//     const author = usePostInfoDetails.author()
//     const url = usePostInfoDetails.url()?.toString()
//     const [decryptions, _setDecryption] = useState<Record<string, (DecryptProgress | DecryptionInfo)[]>>({})
//     function setDecryption(f: (val: typeof decryptions) => void) {
//         _setDecryption((val) => draft(val, f))
//     }

//     useEffect(() => {
//         const abort = new AbortController()
//         async function main() {
//             const process = ServicesWithProgress.decryptionWithSocialNetworkDecoding(payloads, {
//                 authorHint: author,
//                 currentProfile: whoAmI,
//                 currentSocialNetwork: SocialNetworkEnum.Twitter,
//                 postURL: url,
//             })
//             const currentPassIDs = new Set<string>()
//             abort.signal.addEventListener('abort', () => {
//                 setDecryption((val) => {
//                     for (const id of currentPassIDs) delete val[id]
//                 })
//             })
//             for await (const [id, item] of process) {
//                 if (abort.signal.aborted) return
//                 currentPassIDs.add(id)
//                 setDecryption((val) => {
//                     val[id] ||= []
//                     val[id] = [item, ...val[id]]
//                 })
//             }
//         }
//         main()

//         return () => abort.abort()
//     }, [payloads, author.toText(), whoAmI.toText(), url])

//     return decryptions
// }

function isDecryptSuccess(value: DecryptProgress | DecryptionInfo): value is DecryptSuccess {
    return value.type === DecryptProgressKind.Success
}

function isDecryptError(value: DecryptProgress | DecryptionInfo): value is DecryptError {
    return value.type === DecryptProgressKind.Error
}

function isDecryptProgress(value: DecryptProgress | DecryptionInfo): value is DecryptIntermediateProgress {
    return value.type === DecryptProgressKind.Progress
}
