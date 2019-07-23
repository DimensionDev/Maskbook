import React, { useCallback } from 'react'
import { LiveSelector, MutationObserverWatcher, DomProxy, ValueRef } from '@holoflows/kit'
import { getPersonIdentifierAtFacebook } from './MyUsername'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import { PersonIdentifier } from '../../../database/type'
import { isMobile } from '../../../social-network-provider/facebook.com/isMobile'
import { PostComment } from '../../../components/InjectedComponents/PostComments'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { PostInspector } from './Posts/PostInspector'
import { CommentBox } from '../../../components/InjectedComponents/CommentBox'
import { selectElementContents, dispatchCustomEvents, sleep } from '../../../utils/utils'
import Services from '../../service'

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>(
    isMobile ? '.story_body_container ' : '.userContent, .userContent+*+div>div>div>div>div',
)

type InspectedPostInfo = {
    postBy: ValueRef<PersonIdentifier>
    postID: ValueRef<string | null>
    postContent: ValueRef<string>
    postPayload: ValueRef<ReturnType<typeof deconstructPayload> | null>
    comments: Set<HTMLElement>
    decryptedPostContent: ValueRef<string>
}

const inspectedPosts = new Set<InspectedPostInfo>()
new MutationObserverWatcher(posts)
    .useForeach(node => {
        const info: InspectedPostInfo = {
            comments: new Set(),
            decryptedPostContent: new ValueRef(''),
            postBy: new ValueRef(PersonIdentifier.unknown),
            postContent: new ValueRef(''),
            postID: new ValueRef(''),
            postPayload: new ValueRef(null),
        }
        inspectedPosts.add(info)

        function collectPostInfo() {
            info.postContent.value = node.current.innerText
            info.postPayload.value = deconstructPayload(info.postContent.value)
            info.postBy.value = getPostBy(node, info.postPayload.value !== null)
            info.postID.value = getPostID(node)
        }
        collectPostInfo()
        clickSeeMore(node)

        const root = new LiveSelector().replace(() => [node.current]).closest('.userContentWrapper')
        // ? inject after comments
        const commentSelector = root
            .clone()
            .querySelectorAll('[role=article]')
            .querySelectorAll('a+span')
            .closest<HTMLElement>(2)
        const commentWatcher = new MutationObserverWatcher(commentSelector, root.evaluateOnce()[0])
            .useForeach(commentNode => {
                const commentRef = new ValueRef(commentNode.current.innerText)
                const CommentUI = () => {
                    const postContent = useValueRef(info.decryptedPostContent)
                    const comment = useValueRef(commentRef)
                    return (
                        <PostComment
                            needZip={useCallback(() => {
                                commentNode.current.style.whiteSpace = 'nowrap'
                                commentNode.current.style.overflow = 'hidden'
                            }, [])}
                            comment={comment}
                            postContent={postContent}
                            postIV={info.postPayload.value ? info.postPayload.value.iv : ''}
                        />
                    )
                }
                const unmount = renderInShadowRoot(<CommentUI />, commentNode.afterShadow)
                return {
                    onNodeMutation() {
                        commentRef.value = commentNode.current.innerText
                    },
                    onTargetChanged() {
                        commentRef.value = commentNode.current.innerText
                    },
                    onRemove() {
                        unmount()
                    },
                }
            })
            .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
            .startWatch()

        // ? inject comment text field
        const commentBoxSelector = root
            .clone()
            .querySelector<HTMLFormElement>('form form')
            .enableSingleMode()
        const commentBoxWatcher = new MutationObserverWatcher(commentBoxSelector, root.evaluateOnce()[0])
            .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
            .enableSingleMode()
            .startWatch()
        const CommentBoxUI = () => {
            const payload = useValueRef(info.postPayload)
            const decrypted = useValueRef(info.decryptedPostContent)
            return (
                <CommentBox
                    display={!!(payload && decrypted)}
                    onSubmit={async content => {
                        const encryptedComment = await Services.Crypto.encryptComment(payload!.iv, decrypted, content)
                        const _root = root.evaluateOnce()[0] as HTMLDivElement
                        selectElementContents(_root.querySelector('[contenteditable]')!)
                        dispatchCustomEvents('paste', encryptedComment)
                        await sleep(200)
                        if (_root.innerText.match(encryptedComment)) 'Okay'
                        else prompt('Please paste it into the comment box!', encryptedComment)
                    }}
                />
            )
        }
        const unmountCommentBox = renderInShadowRoot(<CommentBoxUI />, commentBoxWatcher.firstVirtualNode.afterShadow)

        // ? inject after posts
        const zipPost = () => {
            zipEncryptedPostContent(node)
            zipPostLinkPreview(node)
        }
        const onDecrypted = (val: string) => (info.decryptedPostContent.value = val)
        const PostDecryptUI = () => {
            const id = useValueRef(info.postID)
            const by = useValueRef(info.postBy)
            const content = useValueRef(info.postContent)
            return (
                <PostInspector
                    onDecrypted={onDecrypted}
                    needZip={zipPost}
                    postId={id || ''}
                    post={content}
                    postBy={by}
                />
            )
        }
        // Render it
        const unmountPostInspector = renderInShadowRoot(<PostDecryptUI />, node.afterShadow)
        return {
            onNodeMutation: collectPostInfo,
            onTargetChanged: collectPostInfo,
            onRemove() {
                unmountPostInspector()
                unmountCommentBox()
                commentWatcher.stopWatch()
                commentBoxWatcher.stopWatch()
            },
        }
    })
    .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
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
