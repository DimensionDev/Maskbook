import React, { useState } from 'react'
import { DecryptPostUI } from '../../../../components/InjectedComponents/DecryptedPost'
import { AddToKeyStore } from '../../../../components/InjectedComponents/AddToKeyStore'
import { useAsync } from '../../../../utils/components/AsyncComponent'
import { deconstructPayload } from '../../../../utils/type-transform/Payload'
import Services from '../../../service'
import { PersonIdentifier, PostIdentifier } from '../../../../database/type'
import { Person } from '../../../../database'
import { styled } from '@material-ui/core/styles'
import { useFriendsList, useMyIdentities } from '../../../../components/DataSource/useActivatedUI'

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
    // TODO:
    const identities = useMyIdentities()
    const whoAmI = identities[0] && identities[0].identifier || PersonIdentifier.unknown
    const people = useFriendsList()
    const [alreadySelectedPreviously, setAlreadySelectedPreviously] = useState<Person[]>([])
    if (postBy.isUnknown) return null
    const type = {
        encryptedPost: deconstructPayload(post),
        provePost: post.match(/🔒(.+)🔒/)!,
    }
    if (type.provePost) Services.People.uploadProvePostUrl(new PostIdentifier(postBy, postId))
    useAsync(() => {
        if (!whoAmI.equals(postBy)) return Promise.resolve([])
        if (!type.encryptedPost) return Promise.resolve([])
        const { iv } = type.encryptedPost
        return Services.Crypto.getSharedListOfPost(iv, postBy)
    }, [post, postBy, whoAmI]).then(p => setAlreadySelectedPreviously(p))
    if (type.encryptedPost) {
        props.needZip()
        const { iv, ownersAESKeyEncrypted } = type.encryptedPost
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
                            iv,
                            ownersAESKeyEncrypted,
                            iv,
                            people.map(x => x.identifier),
                            whoAmI,
                        )
                    }}
                    alreadySelectedPreviously={alreadySelectedPreviously}
                    people={people}
                    encryptedText={post}
                    whoAmI={whoAmI}
                    postBy={postBy}
                />
            </>
        )
    } else if (type.provePost) {
        return <AddToKeyStore postBy={postBy} provePost={post} />
    }
    return null
}
