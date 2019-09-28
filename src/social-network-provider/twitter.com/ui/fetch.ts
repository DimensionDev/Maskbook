import { bioCard, postsRootSelector, postsSelectors, selfInfoSelectors } from '../utils/selector'
import { MutationObserverWatcher } from '@holoflows/kit'
import { PersonIdentifier } from '../../../database/type'
import { getEmptyPostInfo, SocialNetworkUI, SocialNetworkUIInformationCollector } from '../../../social-network/ui'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import { instanceOfTwitterUI } from './index'
import { postParser, resolveInfoFromBioCard } from '../utils/fetch'
import { uploadToService } from '../utils/user'
import { isNil } from 'lodash-es'

const resolveLastRecognizedIdentity = (self: SocialNetworkUI) => {
    const selfSelector = selfInfoSelectors().screenName
    const assign = () => {
        const ref = self.lastRecognizedIdentity
        const screenName = selfInfoSelectors().screenName.evaluate()
        const nickname = selfInfoSelectors().name.evaluate()
        const avatar = selfInfoSelectors().userAvatar.evaluate()
        if (!isNil(screenName)) {
            ref.value = {
                identifier: new PersonIdentifier(self.networkIdentifier, screenName),
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
                const r = resolveInfoFromBioCard()
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

const registerPostCollector = (self: SocialNetworkUI) => {
    new MutationObserverWatcher(postsSelectors())
        .useForeach((node, _, proxy) => {
            const info = getEmptyPostInfo(postsRootSelector())
            // push to map
            self.posts.set(proxy, info)
            const collectPostInfo = () => {
                const r = postParser(node)
                if (!r) return
                info.postContent.value = r.content
                const postBy = new PersonIdentifier(self.networkIdentifier, r.handle)
                if (!info.postBy.value.equals(postBy)) {
                    info.postBy.value = postBy
                }
                info.postID.value = r.pid
                uploadToService(r)
            }
            collectPostInfo()
            info.postPayload.value = deconstructPayload(info.postContent.value, self.payloadDecoder)
            info.postContent.addListener(newValue => {
                info.postPayload.value = deconstructPayload(newValue, self.payloadDecoder)
            })
            return {
                onNodeMutation: collectPostInfo,
                onTargetChanged: collectPostInfo,
                onRemove: () => self.posts.delete(proxy),
            }
        })
        .setDOMProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch({
            childList: true,
            subtree: true,
        })
        .then()
}

export const twitterUIFetch: SocialNetworkUIInformationCollector = {
    resolveLastRecognizedIdentity: () => resolveLastRecognizedIdentity(instanceOfTwitterUI),
    collectPeople: registerUserCollector,
    collectPosts: () => registerPostCollector(instanceOfTwitterUI),
}
