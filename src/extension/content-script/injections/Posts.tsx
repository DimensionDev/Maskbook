import React from 'react'
import ReactDOM from 'react-dom'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { DecryptPost } from '../../../components/InjectedComponents/DecryptedPost'
import { AddToKeyStore } from '../../../components/InjectedComponents/AddToKeyStore'
import { PeopleService } from '../rpc'
import { getUsername } from './LiveSelectors'

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>('.userContent, .userContent+*+div>div>div>div>div')

const PostInspector = (props: { post: string; postBy: string; postId: string; needZip(): void }) => {
    const { post, postBy, postId } = props
    const type = {
        encryptedPost: post.match(/🎼([a-zA-Z0-9\+=\/|]+):\|\|/),
        provePost: post.match(/🔒(.+)🔒/)!,
    }

    if (type.encryptedPost) {
        props.needZip()
        return <DecryptPost encryptedText={post} whoAmI={getUsername()!} postBy={postBy} />
    } else if (type.provePost) {
        PeopleService.uploadProvePostUrl(postBy, postId)
        return <AddToKeyStore postBy={postBy} provePost={post} />
    }
    return null
}
new MutationObserverWatcher(posts)
    .useNodeForeach((node, key, realNode) => {
        // Get author
        const postBy = getUsername(node.current.parentElement!.querySelectorAll('a')[1])!
        // Save author's avatar
        try {
            const avatar = node.current.parentElement!.querySelector('img')!
            PeopleService.storeAvatar(postBy, avatar.getAttribute('aria-label')!, avatar.src)
        } catch {}
        // Get post id
        let postId = ''
        try {
            const postIdInHref = location.href.match(
                /plugins.+(perma.+story_fbid%3D|posts%2F)((?<id>\d+)%26).+(&width=500)?/,
            )
            postId =
                // In single url
                (postIdInHref && postIdInHref.groups!.id) ||
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
        {
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
        }
        // Render it
        const render = () => {
            ReactDOM.render(
                <PostInspector
                    needZip={() => {
                        {
                            // Post content
                            const pe = node.current.parentElement
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
                        {
                            // Link preview
                            const parent = node.current.parentElement!.querySelector('a[href*="maskbook.io"] img')
                            if (parent) {
                                parent.parentElement!.parentElement!.parentElement!.parentElement!.parentElement!.parentElement!.style.display =
                                    'none'
                            }
                        }
                    }}
                    postId={postId}
                    post={node.current.innerText}
                    postBy={postBy}
                />,
                node.after,
            )
        }
        render()
        return {
            onNodeMutation: render,
            onRemove: () => ReactDOM.unmountComponentAtNode(node.after),
        }
    })
    .startWatch()
