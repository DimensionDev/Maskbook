import { useMemo } from 'react'
import { delay, TypedMessageTuple, type ProfileIdentifier } from '@masknet/shared-base'
import { or } from '@masknet/theme'

import type { Profile } from '../../../database'
import type {
    DecryptionProgress,
    FailureDecryption,
    SuccessDecryption,
} from '../../../extension/background-script/CryptoServices/decryptFrom'
import { DecryptPostSuccess } from './DecryptedPostSuccess'
import { DecryptPostAwaiting } from './DecryptPostAwaiting'
import { DecryptPostFailed } from './DecryptPostFailed'
import { usePostClaimedAuthor, usePostInfoDetails } from '../../DataSource/usePostInfo'

export interface DecryptPostProps {
    onDecrypted: (post: TypedMessageTuple) => void
    whoAmI: ProfileIdentifier
    profiles: Profile[]
    alreadySelectedPreviously: Profile[]
    requestAppendRecipients?(to: Profile[]): Promise<void>
}
export function DecryptPost(props: DecryptPostProps) {
    const { whoAmI, profiles, alreadySelectedPreviously, onDecrypted } = props
    const authorInPayload = usePostClaimedAuthor()
    const currentPostBy = usePostInfoDetails.postBy()
    const postBy = or(authorInPayload, currentPostBy)

    const requestAppendRecipientsWrapped = useMemo(() => {
        if (!postBy.equals(whoAmI)) return undefined
        if (!props.requestAppendRecipients) return undefined
        return async (people: Profile[]) => {
            await props.requestAppendRecipients!(people)
            await delay(1500)
        }
    }, [props.requestAppendRecipients, postBy, whoAmI])

    return <>In progress...</>

    function renderProgress(progress: SuccessDecryption | FailureDecryption | DecryptionProgress) {
        const render = () => {
            switch (progress.type) {
                case 'success':
                    return (
                        <DecryptPostSuccess
                            data={progress}
                            alreadySelectedPreviously={alreadySelectedPreviously}
                            requestAppendRecipients={requestAppendRecipientsWrapped}
                            profiles={profiles}
                            sharedPublic
                            author={authorInPayload}
                            postedBy={currentPostBy}
                        />
                    )
                case 'error':
                    return (
                        <DecryptPostFailed
                            error={new Error(progress.error)}
                            author={authorInPayload}
                            postedBy={currentPostBy}
                        />
                    )
                case 'progress':
                    return <DecryptPostAwaiting type={progress} author={authorInPayload} postedBy={currentPostBy} />
                default:
                    return null
            }
        }
        const rendered = render()
        if (!rendered) return null
        return rendered
    }
}
