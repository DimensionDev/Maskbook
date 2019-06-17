import React, { useState } from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { DecryptPostUI } from '../../../components/InjectedComponents/DecryptedPost'
import { AddToKeyStore } from '../../../components/InjectedComponents/AddToKeyStore'
import { getPersonIdentifierAtFacebook, usePersonIdentifierAtFacebook } from './LiveSelectors'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { usePeople } from '../../../components/DataSource/PeopleRef'
import { useAsync } from '../../../utils/components/AsyncComponent'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import Services from '../../service'
import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { Person } from '../../../database'

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>('.userContent, .userContent+*+div>div>div>div>div')

interface PostInspectorProps {
    post: string
    postBy: PersonIdentifier
    postId: string
    needZip(): void
}
function PostInspector(props: PostInspectorProps) {
    const { post, postBy, postId } = props
    const type = {
        encryptedPost: deconstructPayload(post),
        provePost: post.match(/🔒(.+)🔒/)!,
    }
    if (type.encryptedPost) {
        props.needZip()
        const whoAmI = usePersonIdentifierAtFacebook()
        const people = usePeople()
        const [alreadySelectedPreviously, setAlreadySelectedPreviously] = useState<Person[]>([])
        const { iv, ownersAESKeyEncrypted } = type.encryptedPost
        if (whoAmI.equals(postBy)) {
            useAsync(() => Services.Crypto.getSharedListOfPost(iv), [post]).then(p => setAlreadySelectedPreviously(p))
        }
        return (
            <DecryptPostUI.UI
                requestAppendDecryptor={async people => {
                    setAlreadySelectedPreviously(alreadySelectedPreviously.concat(people))
                    return Services.Crypto.appendShareTarget(
                        iv,
                        ownersAESKeyEncrypted,
                        iv,
                        people.map(x => x.identifier),
                    )
                }}
                alreadySelectedPreviously={alreadySelectedPreviously}
                people={people}
                encryptedText={post}
                whoAmI={whoAmI}
                postBy={postBy}
            />
        )
    } else if (type.provePost) {
        Services.People.uploadProvePostUrl(new PostIdentifier(postBy, postId))
        return <AddToKeyStore postBy={postBy} provePost={post} />
    }
    return null
}
new MutationObserverWatcher(posts)
    .assignKeys(node => node.innerText)
    .useForeach(node => {
        // Get author
        const postBy = getPersonIdentifierAtFacebook(node.current.parentElement!.querySelectorAll('a')[1])
        // Save author's avatar
        try {
            const avatar = node.current.parentElement!.querySelector('img')!
            Services.People.storeAvatar(postBy, avatar.src)
        } catch {}
        // Get post id
        let postId = ''
        try {
            const postIdInHref = location.href.match(
                // Firefox doesnot support it.
                // /plugins.+(perma.+story_fbid%3D|posts%2F)((?<id>\d+)%26).+(&width=500)?/,
                /plugins.+(perma.+story_fbid%3D|posts%2F)((\d+)%26).+(&width=500)?/,
            )
            postId =
                // In single url
                // Firefox doesnot support it.
                // (postIdInHref && postIdInHref.groups!.id) ||
                (postIdInHref && postIdInHref[3]) ||
                // In timeline
                node.current.parentElement!.querySelector('div[id^=feed]')!.id.split(';')[2]
        } catch {}
        // Click "See more" if it may be a encrypted post
        {
            const more = node.current.parentElement!.querySelector<HTMLSpanElement>('.see_more_link_inner')
            if (more && node.current.innerText.match(/🎼.+|/)) {
                more.click()
            }
        }
        function zipPostContent() {
            const pe = node.current.parentElement
            // Style modification for repost
            if (!node.current.className.match('userContent') && node.current.innerText.length > 0) {
                node.after.setAttribute(
                    'style',
                    `
                border: 1px solid #ebedf0;
                display: block;
                border-top: none;
                border-bottom: none;
                margin-bottom: -23px;
                padding: 0px 10px;`,
                )
            }
            if (pe) {
                const p = pe.querySelector('p')
                if (p) {
                    p.style.display = 'block'
                    p.style.maxHeight = '20px'
                    p.style.overflow = 'hidden'
                    p.style.marginBottom = '0'
                }
            }
        }
        function zipPostLinkPreview() {
            const img = node.current.parentElement!.querySelector('a[href*="maskbook.io"] img')
            const parent = img && img.closest('span')
            if (img && parent) {
                parent.style.display = 'none'
            }
        }
        function needZip() {
            zipPostContent()
            zipPostLinkPreview()
        }
        // Render it
        return renderInShadowRoot(
            <PostInspector needZip={needZip} postId={postId} post={node.current.innerText} postBy={postBy} />,
            node.afterShadow,
        )
    })
    .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
    .omitWarningForRepeatedKeys()
    .startWatch()
