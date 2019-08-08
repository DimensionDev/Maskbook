import { LiveSelector, MutationObserverWatcher, ValueRef, DomProxy } from '@holoflows/kit'
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
            const root = new LiveSelector().replace(() => [node]).closest('.userContentWrapper')
            // ? inject after comments
            const commentSelector = root
                .clone()
                .querySelectorAll('[role=article]')
                .querySelectorAll('a+span')
                .closest<HTMLElement>(2)

            // ? inject comment text field
            const commentBoxSelector = root
                .clone()
                .querySelector<HTMLFormElement>('form form')
                .enableSingleMode()

            const info: PostInfo = {
                commentsSelector: commentSelector,
                commentBoxSelector: commentBoxSelector,
                decryptedPostContent: new ValueRef(''),
                postBy: new ValueRef(PersonIdentifier.unknown),
                postContent: new ValueRef(''),
                postID: new ValueRef(''),
                postPayload: new ValueRef(null),
                get rootNode() {
                    return root.evaluateOnce()[0]! as HTMLElement
                },
            }
            this.posts.set(metadata, info)
            function collectPostInfo() {
                info.postContent.value = node.innerText
                info.postPayload.value = deconstructPayload(info.postContent.value)
                info.postBy.value = getPostBy(metadata, info.postPayload.value !== null).identifier
                info.postID.value = getPostID(metadata)
            }
            collectPostInfo()
            return {
                onNodeMutation: collectPostInfo,
                onTargetChanged: collectPostInfo,
                onRemove: () => this.posts.delete(metadata),
            }
        })
        .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch()
}

function abc<T>(watcher: MutationObserverWatcher<T, any, any>, iterator: typeof watcher['useForeach']) {}

function getPostBy(node: DomProxy, allowCollectInfo: boolean) {
    const dom = isMobileFacebook
        ? node.current.querySelectorAll('a')
        : [node.current.parentElement!.querySelectorAll('a')[1]]
    return getPersonIdentifierAtFacebook(Array.from(dom), allowCollectInfo)
}
function getPostID(node: DomProxy) {
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
            if (!parent) return ''
            const idNode = parent.querySelector('div[id^=feed]')
            if (!idNode) return ''
            return idNode.id.split(';')[2]
        }
    }
}
