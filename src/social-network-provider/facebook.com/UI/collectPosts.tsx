import { DOMProxy, LiveSelector, MutationObserverWatcher, ValueRef } from '@holoflows/kit'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import { PersonIdentifier } from '../../../database/type'
import { PostInfo, SocialNetworkUI } from '../../../social-network/ui'
import { isMobileFacebook } from '../isMobile'
import { getPersonIdentifierAtFacebook } from '../getPersonIdentifierAtFacebook'

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>(
    isMobileFacebook ? '.story_body_container ' : '.userContent, .userContent+*+div>div>div>div>div',
)

export function collectPostsFacebook(this: SocialNetworkUI) {
    new MutationObserverWatcher(posts)
        .useForeach((node, key, metadata) => {
            const root = new LiveSelector()
                .replace(() => [metadata.realCurrent])
                .filter(x => x)
                .closest('.userContentWrapper')
            // ? inject after comments
            const commentSelectorPC = root
                .clone()
                .querySelectorAll('[role=article]')
                .querySelectorAll('a+span')
                .closest<HTMLElement>(2)
            const commentSelectorMobile = root
                .clone()
                .map(x => x.parentElement)
                .querySelectorAll<HTMLElement>('[data-commentid]')

            const commentSelector = isMobileFacebook ? commentSelectorMobile : commentSelectorPC

            // ? inject comment text field
            const commentBoxSelectorPC = root
                .clone()
                .querySelector<HTMLFormElement>('form form')
                .enableSingleMode()
            const commentBoxSelectorMobile = root
                .clone()
                .map(x => x.parentElement)
                .querySelector('textarea')
                .map(x => x.parentElement)
                .filter(x => x.innerHTML.indexOf('comment') !== -1)
                .enableSingleMode()
            const commentBoxSelector = isMobileFacebook ? commentBoxSelectorMobile : commentBoxSelectorPC

            const info: PostInfo = {
                commentsSelector: commentSelector,
                commentBoxSelector: commentBoxSelector,
                decryptedPostContent: new ValueRef(''),
                postBy: new ValueRef(PersonIdentifier.unknown),
                postContent: new ValueRef(''),
                postID: new ValueRef(null),
                postPayload: new ValueRef(null),
                get rootNode() {
                    return root.evaluate()[0]! as HTMLElement
                },
            }
            this.posts.set(metadata, info)
            function collectPostInfo() {
                info.postContent.value = node.innerText
                const postBy = getPostBy(metadata, info.postPayload.value !== null).identifier
                if (!info.postBy.value.equals(postBy)) {
                    info.postBy.value = postBy
                }
                info.postID.value = getPostID(metadata)
            }
            collectPostInfo()
            info.postPayload.value = deconstructPayload(info.postContent.value)
            info.postContent.addListener(newVal => {
                info.postPayload.value = deconstructPayload(newVal)
            })
            return {
                onNodeMutation: collectPostInfo,
                onTargetChanged: collectPostInfo,
                onRemove: () => this.posts.delete(metadata),
            }
        })
        .setDOMProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch({
            childList: true,
            subtree: true,
        })
}

function getPostBy(node: DOMProxy, allowCollectInfo: boolean) {
    const dom = isMobileFacebook
        ? node.current.querySelectorAll('a')
        : [node.current.parentElement!.querySelectorAll('a')[1]]
    // side effect: save to service
    return getPersonIdentifierAtFacebook(Array.from(dom), allowCollectInfo)
}
function getPostID(node: DOMProxy): null | string {
    if (isMobileFacebook) {
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
            if (!parent) return null
            const idNode = Array.from(parent.querySelectorAll('[id]'))
                .map(x => x.id.split(';'))
                .filter(x => x.length > 1)
            if (!idNode.length) return null
            return idNode[0][2]
        }
    }
}
