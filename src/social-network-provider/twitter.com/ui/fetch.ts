import { bioCard, postParser, postsRootSelector, postsSelectors, selfInfoSelectors } from '../utils/selector'
import { MutationObserverWatcher } from '@holoflows/kit'
import { PersonIdentifier } from '../../../database/type'
import { host } from '../index'
import { getEmptyPostInfo, SocialNetworkUI, SocialNetworkUIInformationCollector } from '../../../social-network/ui'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import { notEmpty } from '../../../utils/assert'
import { instanceOfTwitterUI } from './index'
import { resolveInfoFromBioCard } from '../utils/fetch'
import { uploadToService } from '../utils/user'

const resolveLastRecognizedIdentity = (self: SocialNetworkUI) => {
    const selfSelector = selfInfoSelectors().screenName
    const assign = () => {
        const ref = self.lastRecognizedIdentity
        const info = selfInfoSelectors().screenName.evaluate()
        const id = new PersonIdentifier(host, notEmpty(info, 'user id not found'))
        if (!id.isUnknown) {
            ref.value = { identifier: id }
        }
    }
    new MutationObserverWatcher(selfSelector)
        .addListener('onAdd', () => assign())
        .addListener('onChange', () => assign())
        .startWatch()
        .then()
}

const registerUserCollector = () => {
    new MutationObserverWatcher(bioCard())
        .useForeach(() => {
            const updateUser = () => {
                const r = resolveInfoFromBioCard()
                uploadToService(r)
            }
            updateUser()
            return {
                onNodeMutation: updateUser,
                onTargetChanged: updateUser,
            }
        })
        .startWatch()
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
                const postBy = new PersonIdentifier(host, r.handle)
                if (!info.postBy.value.equals(postBy)) {
                    info.postBy.value = postBy
                }
                info.postID.value = r.pid
                uploadToService(r)
            }
            collectPostInfo()
            info.postPayload.value = deconstructPayload(info.postContent.value)
            info.postContent.addListener(newValue => {
                info.postPayload.value = deconstructPayload(newValue)
            })
            return {
                onNodeMutation: collectPostInfo,
                onTargetChanged: collectPostInfo,
                onRemove: () => self.posts.delete(proxy),
            }
        })
        .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch()
        .then()
}

export const twitterUIFetch: SocialNetworkUIInformationCollector = {
    resolveLastRecognizedIdentity: () => resolveLastRecognizedIdentity(instanceOfTwitterUI),
    collectPeople: registerUserCollector,
    collectPosts: () => registerPostCollector(instanceOfTwitterUI),
}
