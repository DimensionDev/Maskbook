import React, { useState } from 'react'
import { DecryptPost, DecryptPostProps } from './DecryptedPost'
import { AddToKeyStore, AddToKeyStoreProps } from './AddToKeyStore'
import { useAsync } from '../../utils/components/AsyncComponent'
import { deconstructPayload } from '../../utils/type-transform/Payload'
import Services from '../../extension/service'
import { ProfileIdentifier } from '../../database/type'
import { Profile } from '../../database'
import { useCurrentIdentity, useFriendsList } from '../DataSource/useActivatedUI'
import { getActivatedUI } from '../../social-network/ui'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { debugModeSetting } from '../shared-settings/settings'
import { DebugList } from '../DebugModeUI/DebugList'

export interface PostInspectorProps {
    onDecrypted(post: string): void
    post: string
    postBy: ProfileIdentifier
    postId: string
    needZip(): void
    DecryptPostProps?: Partial<DecryptPostProps>
    DecryptPostComponent?: React.ComponentType<DecryptPostProps>
    AddToKeyStoreProps?: Partial<AddToKeyStoreProps>
    AddToKeyStoreComponent?: React.ComponentType<AddToKeyStoreProps>
}
export function PostInspector(props: PostInspectorProps) {
    const { post, postBy, postId } = props
    const whoAmI = useCurrentIdentity()
    const people = useFriendsList()
    const [alreadySelectedPreviously, setAlreadySelectedPreviously] = useState<Profile[]>([])
    const decodeAsPublicKey = getActivatedUI().publicKeyDecoder(post)
    const isDebugging = useValueRef(debugModeSetting)
    const type = {
        encryptedPost: deconstructPayload(post, getActivatedUI().payloadDecoder),
        provePost: decodeAsPublicKey,
    }
    if (type.provePost && postId) Services.Identity.writeProfileOnGun(postBy, { provePostId: postId })
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
                ['My fingerprint', whoAmI?.linkedPersona?.fingerprint ?? 'Unknown'],
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
        const DecryptPostX = props.DecryptPostComponent || DecryptPost
        return (
            <>
                <DecryptPostX
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
                    whoAmI={whoAmI ? whoAmI.identifier : ProfileIdentifier.unknown}
                    postBy={postBy}
                    {...props.DecryptPostProps}
                />
                {debugInfo}
            </>
        )
    } else if (type.provePost.length) {
        const AddToKeyStoreX = props.AddToKeyStoreComponent || AddToKeyStore
        return (
            <>
                <AddToKeyStoreX postBy={postBy} provePost={post} {...props.AddToKeyStoreProps} />
                {debugInfo}
            </>
        )
    }
    return debugInfo
}
