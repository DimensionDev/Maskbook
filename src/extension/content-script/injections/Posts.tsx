import React, { useState } from 'react'
import { LiveSelector, MutationObserverWatcher, DomProxy, ValueRef } from '@holoflows/kit'
import { DecryptPostUI } from '../../../components/InjectedComponents/DecryptedPost'
import { AddToKeyStore } from '../../../components/InjectedComponents/AddToKeyStore'
import { getPersonIdentifierAtFacebook, useIdentitiesAtFacebook } from './MyUsername'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { usePeople } from '../../../components/DataSource/PeopleRef'
import { useAsync } from '../../../utils/components/AsyncComponent'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import Services from '../../service'
import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { Person } from '../../../database'
import { isMobile } from '../../../social-network/facebook.com/isMobile'
import { styled } from '@material-ui/core/styles'
import { PostCommentDecrypted } from '../../../components/InjectedComponents/PostComments'
import { useValueRef } from '../../../utils/hooks/useValueRef'

const Debug = styled('div')({ display: 'none' })

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>(
    isMobile ? '.story_body_container ' : '.userContent, .userContent+*+div>div>div>div>div',
)

interface PostInspectorProps {
    post: string
    postBy: PersonIdentifier
    postId: string
    needZip(): void
}
function PostInspector(props: PostInspectorProps) {
    const { post, postBy, postId } = props
    const whoAmI = (useIdentitiesAtFacebook()[0] || { identifier: PersonIdentifier.unknown }).identifier
    const people = usePeople()
    const [alreadySelectedPreviously, setAlreadySelectedPreviously] = useState<Person[]>([])

    if (postBy.isUnknown) return null
    const type = {
        encryptedPost: deconstructPayload(post),
        provePost: post.match(/🔒(.+)🔒/)!,
    }
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
        Services.People.uploadProvePostUrl(new PostIdentifier(postBy, postId))
        return <AddToKeyStore postBy={postBy} provePost={post} />
    }
    return null
}
const commentUnload = new Map<HTMLElement, [() => void, DomProxy]>()
type InspectedPostInfo = {
    postBy: ValueRef<PersonIdentifier>
    postID: ValueRef<string | null>
    postContent: ValueRef<string>
}

const inspectedPosts = new Set<InspectedPostInfo>()
new MutationObserverWatcher(posts)
    .assignKeys(node => node.innerText)
    .useForeach(node => {
        const info = {} as InspectedPostInfo
        inspectedPosts.add(info)

        function collectPostInfo() {
            info.postContent = new ValueRef(node.current.innerText)
            info.postBy = new ValueRef(getPostBy(node, deconstructPayload(info.postContent.value) !== null))
            info.postID = new ValueRef(getPostID(node))
        }
        collectPostInfo()

        try {
            Array.from<HTMLSpanElement>(
                new Set(
                    node.current
                        .closest('.userContentWrapper')!
                        .querySelector('[role=article]')!
                        .querySelectorAll('a+span'),
                ),
            ).forEach(t => {
                const parent = t.parentElement!.parentElement!.parentElement!
                if (commentUnload.has(parent)) return
                const i = DomProxy()
                // i.realCurrent = parent
                commentUnload.set(i.realCurrent!, [
                    renderInShadowRoot(
                        <PostCommentDecrypted>{i.current.innerText}</PostCommentDecrypted>,
                        i.afterShadow,
                    ),
                    node,
                ])
            })
        } catch {}

        clickSeeMore(node)
        const zipPost = () => {
            zipEncryptedPostContent(node)
            zipPostLinkPreview(node)
        }
        const UI = () => {
            const id = useValueRef(info.postID)
            const by = useValueRef(info.postBy)
            const content = useValueRef(info.postContent)
            return <PostInspector needZip={zipPost} postId={id || ''} post={content} postBy={by} />
        }
        // Render it
        const unmount = renderInShadowRoot(<UI />, node.afterShadow)
        return {
            onNodeMutation: collectPostInfo,
            onTargetChanged: collectPostInfo,
            onRemove() {
                unmount()
                commentUnload.forEach(([f, n]) => n === node && f())
            },
        }
    })
    .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
    .omitWarningForRepeatedKeys()
    .startWatch()

function zipPostLinkPreview(node: DomProxy) {
    if (isMobile) {
        const img = node.current.parentElement!.querySelector('a[href*="maskbook.io"]')
        const parent = img && img.closest('section')
        if (img && parent) {
            parent.style.display = 'none'
        }
    } else {
        const img = node.current.parentElement!.querySelector('a[href*="maskbook.io"] img')
        const parent = img && img.closest('span')
        if (img && parent) {
            parent.style.display = 'none'
        }
    }
}
function zipEncryptedPostContent(node: DomProxy) {
    const parent = node.current.parentElement
    // Style modification for repost
    if (!node.current.className.match('userContent') && node.current.innerText.length > 0) {
        node.after.setAttribute(
            'style',
            `border: 1px solid #ebedf0;
display: block;
border-top: none;
border-bottom: none;
margin-bottom: 0px;
padding: 0px 10px;`,
        )
    }
    if (parent) {
        // post content
        const p = parent.querySelector('p')
        if (p) {
            p.style.display = 'block'
            p.style.maxHeight = '20px'
            p.style.overflow = 'hidden'
            p.style.marginBottom = '0'
        }
    }
}

function clickSeeMore(node: DomProxy) {
    const more = node.current.parentElement!.querySelector<HTMLSpanElement>('.see_more_link_inner')
    if (!isMobile && more && node.current.innerText.match(/🎼.+|/)) {
        more.click()
    }
}

function getPostBy(node: DomProxy, allowCollectInfo: boolean) {
    const dom = isMobile ? node.current.querySelectorAll('a') : [node.current.parentElement!.querySelectorAll('a')[1]]
    return getPersonIdentifierAtFacebook(Array.from(dom), allowCollectInfo)
}
function getPostID(node: DomProxy) {
    if (isMobile) {
        const abbr = node.current.querySelector('abbr')
        if (!abbr) return null
        const idElement = abbr.closest('a')
        if (!idElement) return null
        const id = new URL(idElement.href)
        return id.searchParams.get('id') || ''
    } else {
        // In single url
        if (location.href.match(/plugins.+(perma.+story_fbid%3D|posts%2F)?/)) {
            const url = new URL(location.href)
            return url.searchParams.get('id')
        } else {
            // In timeline
            const parent = node.current.parentElement
            if (!parent) return ''
            const idNode = parent.querySelector('div[id^=feed]')
            if (!idNode) return ''
            return idNode.id.split(';')[2]
        }
    }
}
