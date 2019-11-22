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
import { isNil } from 'lodash-es'
import Services from '../../../extension/service'
import { twitterUrl } from '../utils/url'
import { PreDefinedTwitterGroupNames } from './group'

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
}

const registerUserCollector = () => {
    new MutationObserverWatcher(bioCard())
        .useForeach((cardNode: HTMLDivElement) => {
            const resolve = async () => {
                const { isFollower, isFollowing, identifier, bio, name, avatar } = bioCardParser(cardNode)
                Services.People.updatePersonInfo(identifier, {
                    nickname: name,
                    avatarURL: avatar,
                }).then()
                const [verified, myIdentities] = await Promise.all([
                    Services.Crypto.verifyOthersProve(bio, identifier),
                    Services.People.queryMyIdentity(),
                ])
                const myIdentity =
                    myIdentities.filter(({ identifier }) => identifier.network === twitterUrl.hostIdentifier)[0] ||
                    PersonIdentifier.unknown
                const myFirends = GroupIdentifier.getDefaultFriendsGroupIdentifier(myIdentity.identifier)
                const myFollowers = GroupIdentifier.getFriendsGroupIdentifier(
                    myIdentity.identifier,
                    PreDefinedTwitterGroupNames.followers,
                )
                const myFollowing = GroupIdentifier.getFriendsGroupIdentifier(
                    myIdentity.identifier,
                    PreDefinedTwitterGroupNames.following,
                )
                if (verified && (isFollower || isFollowing)) {
                    if (isFollower) {
                        Services.People.addPersonToFriendsGroup(myFollowers, [identifier]).then()
                    }
                    if (isFollowing) {
                        Services.People.addPersonToFriendsGroup(myFollowing, [identifier]).then()
                    }
                    if (isFollower && isFollowing) {
                        Services.People.addPersonToFriendsGroup(myFirends, [identifier]).then()
                    }
                } else {
                    Services.People.removePersonFromFriendsGroup(myFirends, [identifier]).then()
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
}

const registerPostCollector = (self: SocialNetworkUI) => {
    new MutationObserverWatcher(postsSelector())
        .useForeach((node, _, proxy) => {
            // noinspection JSUnnecessarySemicolon
            const info = getEmptyPostInfoByElement({
                get rootNode() {
                    return proxy.current
                },
                rootNodeProxy: proxy,
            })
            info.postPayload.value = deconstructPayload(info.postContent.value, self.payloadDecoder)
            const collectPostInfo = async () => {
                const { pid, content, handle, name, avatar } = await postParser(node)
                if (!pid) return false
                const postBy = new PersonIdentifier(self.networkIdentifier, handle)
                info.postID.value = pid
                info.postContent.value = content
                if (!info.postBy.value.equals(postBy)) {
                    info.postBy.value = postBy
                }
                Services.People.updatePersonInfo(postBy, {
                    nickname: name,
                    avatarURL: avatar,
                }).then()
            }
            ;(async () => {
                await collectPostInfo()
                info.postContent.addListener(newValue => {
                    info.postPayload.value = deconstructPayload(newValue, self.payloadDecoder)
                })
                // push to map. proxy used as a pointer here.
                self.posts.set(proxy, info)
            })()
            return {
                onNodeMutation: collectPostInfo,
                onTargetChanged: collectPostInfo,
                onRemove: () => self.posts.delete(proxy),
            }
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
