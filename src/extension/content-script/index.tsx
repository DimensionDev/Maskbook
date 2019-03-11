import '../../crypto'
import '../../key-management/keys'
import './generatePost'
import React from 'react'
import ReactDOM from 'react-dom'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { AdditionalPostBox } from '../../components/InjectedComponents/AdditionalPostBox'
import { uploadProvePostUrl } from '../../key-management'
import { DecryptPost } from '../../components/InjectedComponents/DecryptedPost'
import { storeAvatar } from '../../key-management/avatar-db'
import { AddToKeyStore } from '../../components/InjectedComponents/AddToKeyStore'

const box = new MutationObserverWatcher(
    new LiveSelector()
        .querySelector('[role="dialog"][aria-label="Create a post"]')
        .map(x => x.lastElementChild)
        .map(x => x.lastElementChild),
).startWatch()
ReactDOM.render(<AdditionalPostBox />, box.firstVirtualNode.after)

const myself = new LiveSelector()
    .querySelector<HTMLAnchorElement>(`[aria-label="Facebook"][role="navigation"] [data-click="profile_icon"] a`)
    .map(x => x.href.split('https://www.facebook.com/')[1])

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>('.userContent').filter((x: HTMLElement | null) => {
    while (x) {
        if (x.classList.contains('hidden_elem')) return false
        // tslint:disable-next-line: no-parameter-reassignment
        x = x.parentElement
    }
    return true
})

new MutationObserverWatcher(posts)
    .useNodeForeach((node, key, realNode) => {
        const postBy = node.current
            .previousElementSibling!.querySelector('a')!
            .href.match('https://www.facebook.com/(?<name>[a-zA-Z0-9.]+)?')!.groups!.name
        const avatar = node.current.previousElementSibling!.querySelector('img')!
        storeAvatar(postBy, avatar.src)
        const PostInspector = (props: { post: string }) => {
            const { post } = props
            const type = {
                encryptedPost: post.match(/maskbook\:\/\/?(?<text>.+)(?<!See More)( .+)?$/)!,
                provePost: post.match('Here is my public key')!,
            }

            if (type.encryptedPost) {
                return (
                    <DecryptPost
                        encryptedText={type.encryptedPost.groups!.text!}
                        myself={myself.evaluateOnce()[0]!}
                        postBy={postBy}
                    />
                )
            } else if (type.provePost) {
                const postIdInHref = location.href.match(/plugins.+posts.(?<id>\d+)&wi/)
                const postId =
                    // In single url
                    (postIdInHref && postIdInHref.groups!.id) ||
                    // In timeline
                    node.current.previousElementSibling!.querySelector('div[id^=feed]')!.id.split(';')[2]
                uploadProvePostUrl(postBy, postId)
                return <AddToKeyStore postBy={postBy} provePost={post} />
            }
            return null
        }
        const more = node.current.parentElement!.querySelector<HTMLSpanElement>('.see_more_link_inner')
        const after = node.after
        const render = () => {
            ReactDOM.render(<PostInspector post={node.current.innerText} />, after)
        }
        if (more && node.current.innerText.match('maskbook://')) {
            more.click()
        }
        render()
        return {
            onNodeMutation: render,
            onRemove: () => ReactDOM.unmountComponentAtNode(after),
        }
    })
    .startWatch()
Object.assign(window, {
    LiveSelector,
    MutationObserverWatcher,
    box,
})
