import { bioCard, postsSelector, selfInfoSelectors } from '../utils/selector'
import { MutationObserverWatcher } from '@holoflows/kit'
import { GroupIdentifier, PersonIdentifier } from '../../../database/type'
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
import Services from '../../../extension/service'

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
                const theGroup = GroupIdentifier.getDefaultFriendsGroupIdentifier(
                    instanceOfTwitterUI.lastRecognizedIdentity.value.identifier,
                )
                if (r.isFollowing && r.isFollower) {
                    Services.People.addPersonToFriendsGroup(theGroup, [r.identifier]).then()
                } else {
                    Services.People.removePersonFromFriendsGroup(theGroup, [r.identifier]).then()
                }
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
    new MutationObserverWatcher(postsSelector())
        .useForeach((node, _, proxy) => {
            // noinspection JSUnnecessarySemicolon
            ;(async () => {
                const info = getEmptyPostInfoByElement({
                    get rootNode() {
                        return proxy.current
                    },
                    rootNodeProxy: proxy,
                })
                const collectPostInfo = async () => {
                    const r = await postParser(node)
                    if (!r.pid) return false
                    info.postContent.value = r.content
                    const postBy = new PersonIdentifier(self.networkIdentifier, r.handle)
                    if (!info.postBy.value.equals(postBy)) {
                        info.postBy.value = postBy
                    }
                    info.postID.value = r.pid
                    uploadToService(r)
                }
                await collectPostInfo()
                info.postPayload.value = deconstructPayload(info.postContent.value, self.payloadDecoder)
                info.postContent.addListener(newValue => {
                    info.postPayload.value = deconstructPayload(newValue, self.payloadDecoder)
                })
                // push to map. proxy used as a pointer here.
                self.posts.set(proxy, info)
                return {
                    onNodeMutation: collectPostInfo,
                    onTargetChanged: collectPostInfo,
                    onRemove: () => self.posts.delete(proxy),
                }
            })()
        })
        .setDOMProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .assignKeys(node => node.innerHTML)
        .startWatch({
            childList: true,
            subtree: true,
        })
}

export const twitterUIFetch: SocialNetworkUIInformationCollector = {
    resolveLastRecognizedIdentity: () => resolveLastRecognizedIdentity(instanceOfTwitterUI),
    collectPeople: registerUserCollector,
    collectPosts: () => registerPostCollector(instanceOfTwitterUI),
}
