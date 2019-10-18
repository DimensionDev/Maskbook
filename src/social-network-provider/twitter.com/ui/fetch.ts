import { bioCard, postsSelectors, selfInfoSelectors } from '../utils/selector'
import { MutationObserverWatcher } from '@holoflows/kit'
import { PersonIdentifier } from '../../../database/type'
import {
    getEmptyPostInfoByElement,
    SocialNetworkUI,
    SocialNetworkUIInformationCollector,
} from '../../../social-network/ui'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import { instanceOfTwitterUI } from './index'
import { bioCardParser, postParser } from '../utils/fetch'
import { uploadToService } from '../utils/user'
import { isNil } from 'lodash-es'

const resolveLastRecognizedIdentity = (self: SocialNetworkUI) => {
    const selfSelector = selfInfoSelectors().handle
    const assign = () => {
        const ref = self.lastRecognizedIdentity
        const handle = selfInfoSelectors().handle.evaluate()
        const nickname = selfInfoSelectors().name.evaluate()
        const avatar = selfInfoSelectors().userAvatar.evaluate()
        if (!isNil(handle)) {
            ref.value = {
                identifier: new PersonIdentifier(self.networkIdentifier, handle),
                nickname,
                avatar,
            }
        }
    }
    new MutationObserverWatcher(selfSelector)
        .addListener('onAdd', () => assign())
        .addListener('onChange', () => assign())
        .startWatch({
            childList: true,
            subtree: true,
        })
        .then()
}

const registerUserCollector = () => {
    new MutationObserverWatcher(bioCard())
        .useForeach(() => {
            const resolve = () => {
                const r = bioCardParser()
                uploadToService(r)
            }
            resolve()
            return {
                onNodeMutation: resolve,
                onTargetChanged: resolve,
            }
        })
        .startWatch({
            childList: true,
            subtree: true,
        })
        .then()
}

/** TODO: Dirty fix.
 *   since MOW detected changes many times in post page,
 *   we set an array here to storage posts and reduce.
 */
const keys: string[] = []

const registerPostCollector = (self: SocialNetworkUI) => {
    const r = new MutationObserverWatcher(postsSelectors())
        .useForeach((node, _, proxy) => {
            const id = proxy.current.innerHTML
            if (keys.includes(id)) return
            keys.push(id)
            const info = getEmptyPostInfoByElement({
                get rootNode() {
                    return proxy.current
                },
                rootNodeProxy: proxy,
            })
            const collectPostInfo = async () => {
                const r = await postParser(node.querySelector<HTMLElement>('[data-testid="tweet"]')!)
                info.postContent.value = r.content
                const postBy = new PersonIdentifier(self.networkIdentifier, r.handle)
                if (!info.postBy.value.equals(postBy)) {
                    info.postBy.value = postBy
                }
                info.postID.value = r.pid
                uploadToService(r)
            }
            const onRemove = () => {
                self.posts.delete(proxy)
                keys.splice(keys.indexOf(id))
            }
            collectPostInfo().then(() => {
                info.postPayload.value = deconstructPayload(info.postContent.value, self.payloadDecoder)
                info.postContent.addListener(newValue => {
                    info.postPayload.value = deconstructPayload(newValue, self.payloadDecoder)
                })
                // push to map. proxy used as a pointer here.
                self.posts.set(proxy, info)
            })
            return {
                onNodeMutation: collectPostInfo,
                onTargetChanged: collectPostInfo,
                onRemove,
            }
        })
        .setDOMProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch({
            childList: true,
            subtree: true,
        })
    console.log(r)
}

export const twitterUIFetch: SocialNetworkUIInformationCollector = {
    resolveLastRecognizedIdentity: () => resolveLastRecognizedIdentity(instanceOfTwitterUI),
    collectPeople: registerUserCollector,
    collectPosts: () => registerPostCollector(instanceOfTwitterUI),
}
