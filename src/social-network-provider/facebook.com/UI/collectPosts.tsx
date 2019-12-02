import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import { getEmptyPostInfoByElement, PostInfo, SocialNetworkUI } from '../../../social-network/ui'
import { isMobileFacebook } from '../isMobile'
import { getPersonIdentifierAtFacebook } from '../getPersonIdentifierAtFacebook'
import { downloadUrl } from '../../../utils/utils'
import Services from '../../../extension/service'
import { getDimension } from '../../../utils/image'

const posts = new LiveSelector().querySelectorAll<HTMLDivElement>(
    isMobileFacebook ? '.story_body_container ' : '.userContent, .userContent+*+div>div>div>div>div',
)

export function collectPostsFacebook(this: SocialNetworkUI) {
    new MutationObserverWatcher(posts)
        .useForeach((node, key, metadata) => {
            const root = new LiveSelector()
                .replace(() => [metadata.realCurrent])
                .filter(x => x)
                .closest('.userContentWrapper, [data-store]')

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
            const commentBoxSelectorPC = root.clone().querySelectorAll<HTMLFormElement>('form form')

            const commentBoxSelectorMobile = root
                .clone()
                .map(x => x.parentElement)
                .querySelectorAll('textarea')
                .map(x => x.parentElement)
                .filter(x => x.innerHTML.indexOf('comment') !== -1)

            const commentBoxSelector = isMobileFacebook ? commentBoxSelectorMobile : commentBoxSelectorPC

            const info: PostInfo = getEmptyPostInfoByElement({
                commentsSelector: commentSelector,
                commentBoxSelector: commentBoxSelector,
                get rootNode() {
                    return root.evaluate()[0]! as HTMLElement
                },
                rootNodeProxy: metadata,
            })

            this.posts.set(metadata, info)
            function collectPostInfo() {
                info.postContent.value = node.innerText
                info.postBy.value = getPostBy(metadata, info.postPayload.value !== null).identifier
                info.postID.value = getPostID(metadata)
                getSteganographyContent(metadata).then(content => {
                    if (content && info.postContent.value.indexOf(content) === -1 && content.substr(0, 2) === '🎼')
                        info.postContent.value = content
                })
            }
            collectPostInfo()
            info.postPayload.value = deconstructPayload(info.postContent.value, this.payloadDecoder)
            info.postContent.addListener(newVal => {
                info.postPayload.value = deconstructPayload(newVal, this.payloadDecoder)
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
async function getSteganographyContent(node: DOMProxy) {
    const parent = node.current.parentElement
    if (!parent) return ''
    const imgNodes = parent.querySelectorAll<HTMLElement>(
        isMobileFacebook ? 'div>div>div>a>div>div>i.img' : '.uiScaledImageContainer img',
    )
    if (!imgNodes.length) return ''
    const imgUrls = isMobileFacebook
        ? (getComputedStyle(imgNodes[0]).backgroundImage || '')
              .slice(4, -1)
              .replace(/['"]/g, '')
              .split(',')
              .filter(Boolean)
        : Array.from(imgNodes)
              .map(node => node.getAttribute('src') || '')
              .filter(Boolean)
    if (!imgUrls.length) return ''
    const pass = getPostBy(node, false).identifier.toText()
    return (
        await Promise.all(
            imgUrls
                .map(async url => {
                    try {
                        const image = new Uint8Array(await downloadUrl(url))
                        const { width, height } = getDimension(image)
                        if (width !== 1024 || height !== 1240) {
                            console.warn(`image with link ${url} is not steganographic payload`)
                            return ''
                        }
                        const content = await Services.Steganography.decodeImage(image, {
                            pass,
                        })
                        return content.indexOf('🎼') === 0 ? content : ''
                    } catch {
                        return ''
                    }
                })
                .filter(Boolean),
        )
    ).join('\n')
}
