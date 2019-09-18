import React, { useState } from 'react'
import { DecryptPostUI } from './DecryptedPost'
import { AddToKeyStore } from './AddToKeyStore'
import { useAsync } from '../../utils/components/AsyncComponent'
import { deconstructPayload } from '../../utils/type-transform/Payload'
import Services from '../../extension/service'
import { PersonIdentifier } from '../../database/type'
import { Person } from '../../database'
import { styled } from '@material-ui/core/styles'
import { useCurrentIdentity, useFriendsList } from '../DataSource/useActivatedUI'
import { getActivatedUI } from '../../social-network/ui'

const Debug = styled('div')({ display: 'none' })
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
    const decodeResult = getActivatedUI().publicKeyDecoder(post)
    const type = {
        encryptedPost: deconstructPayload(post),
        provePost: decodeResult ? [decodeResult] : null,
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

    if (type.encryptedPost) {
        props.needZip()
        const { iv, ownersAESKeyEncrypted, version } = type.encryptedPost
        return (
            <>
                <Debug children={post} data-id="post" />
                <Debug children={postBy.toText()} data-id="post by" />
                <Debug children={postId} data-id="post id" />
                <DecryptPostUI.UI
                    onDecrypted={props.onDecrypted}
                    requestAppendRecipients={async people => {
                        setAlreadySelectedPreviously(alreadySelectedPreviously.concat(people))
                        return Services.Crypto.appendShareTarget(
                            version,
                            iv,
                            ownersAESKeyEncrypted,
                            iv,
                            people.map(x => x.identifier),
                            whoAmI!.identifier,
                        )
                    }}
                    alreadySelectedPreviously={alreadySelectedPreviously}
                    people={people}
                    encryptedText={post}
                    whoAmI={whoAmI ? whoAmI.identifier : PersonIdentifier.unknown}
                    postBy={postBy}
                />
            </>
        )
    } else if (type.provePost) {
        return <AddToKeyStore postBy={postBy} provePost={post} />
    }
    return null
}
