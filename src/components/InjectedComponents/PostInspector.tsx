import React, { useState } from 'react'
import { DecryptPost } from './DecryptedPost'
import { AddToKeyStore } from './AddToKeyStore'
import { useAsync } from '../../utils/components/AsyncComponent'
import { deconstructPayload } from '../../utils/type-transform/Payload'
import Services from '../../extension/service'
import { PersonIdentifier } from '../../database/type'
import { Person } from '../../database'
import { useCurrentIdentity, useFriendsList } from '../DataSource/useActivatedUI'
import { getActivatedUI } from '../../social-network/ui'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { debugModeSetting } from '../shared-settings/settings'
import { DebugList } from '../DebugModeUI/DebugList'

interface PostInspectorProps {
    onDecrypted(post: string): void
    post: string
    postBy: PersonIdentifier
    postId: string
    needZip(): void
}
export function PostInspector(props: PostInspectorProps) {
    const { post, postBy, postId } = props
    const whoAmI = useCurrentIdentity()
    const people = useFriendsList()
    const [alreadySelectedPreviously, setAlreadySelectedPreviously] = useState<Person[]>([])
    const decodeAsPublicKey = getActivatedUI().publicKeyDecoder(post)
    const isDebugging = useValueRef(debugModeSetting)
    const type = {
        encryptedPost: deconstructPayload(post, getActivatedUI().payloadDecoder),
        provePost: decodeAsPublicKey ? [decodeAsPublicKey] : null,
    }
    if (type.provePost) Services.People.writePersonOnGun(postBy, { provePostId: postId })
    useAsync(async () => {
        if (!whoAmI) return []
        if (!whoAmI.identifier.equals(postBy)) return []
        if (!type.encryptedPost) return []
        const { iv, version } = type.encryptedPost
        return Services.Crypto.getSharedListOfPost(version, iv, postBy)
    }, [post, postBy, whoAmI]).then(p => setAlreadySelectedPreviously(p))

    if (postBy.isUnknown) return null

    const debugInfo = isDebugging ? (
        <DebugList
            items={[
                ['Post by', props.postBy.userId],
                [
                    'Who am I',
                    whoAmI ? `Nickname ${whoAmI.nickname || 'unknown'}, UserID ${whoAmI.identifier.userId}` : 'Unknown',
                ],
                ['My fingerprint', whoAmI ? whoAmI.fingerprint || 'Unknown' : 'unknown'],
                ['Post ID', props.postId || 'Unknown'],
                ['Post Content', props.post],
            ]}
        />
    ) : null

    if (type.encryptedPost) {
        if (!isDebugging) props.needZip()
        const { iv, version } = type.encryptedPost
        const ownersAESKeyEncrypted =
            type.encryptedPost.version === -38
                ? type.encryptedPost.AESKeyEncrypted
                : type.encryptedPost.ownersAESKeyEncrypted
        return (
            <>
                <DecryptPost
                    onDecrypted={props.onDecrypted}
                    requestAppendRecipients={
                        // Version -40 is leaking info
                        // So should not create new data on version -40
                        type.encryptedPost.version === -40
                            ? undefined
                            : async people => {
                                  setAlreadySelectedPreviously(alreadySelectedPreviously.concat(people))
                                  return Services.Crypto.appendShareTarget(
                                      version,
                                      ownersAESKeyEncrypted,
                                      iv,
                                      people.map(x => x.identifier),
                                      whoAmI!.identifier,
                                  )
                              }
                    }
                    alreadySelectedPreviously={alreadySelectedPreviously}
                    people={people}
                    encryptedText={post}
                    whoAmI={whoAmI ? whoAmI.identifier : PersonIdentifier.unknown}
                    postBy={postBy}
                />
                {debugInfo}
            </>
        )
    } else if (type.provePost) {
        return (
            <>
                <AddToKeyStore postBy={postBy} provePost={post} />
                {debugInfo}
            </>
        )
    }
    return debugInfo
}
