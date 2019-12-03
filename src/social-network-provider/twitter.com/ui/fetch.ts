import { bioCard, selfInfoSelectors, postsContentSelector, postsImageSelector } from '../utils/selector'
import { MutationObserverWatcher } from '@holoflows/kit'
import { GroupIdentifier, PersonIdentifier, PreDefinedVirtualGroupNames } from '../../../database/type'
import {
    getEmptyPostInfoByElement,
    SocialNetworkUI,
    SocialNetworkUIInformationCollector,
} from '../../../social-network/ui'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import { instanceOfTwitterUI } from './index'
import { bioCardParser, postParser, postImageParser, postIdParser } from '../utils/fetch'
import { isNil } from 'lodash-es'
import Services from '../../../extension/service'
import { twitterUrl } from '../utils/url'
import { untilElementAvailable } from '../../../utils/dom'

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
                if (!cardNode) return
                const { isFollower, isFollowing, identifier, bio } = bioCardParser(cardNode)
                const [verified, myIdentities] = await Promise.all([
                    Services.Crypto.verifyOthersProve(bio, identifier),
                    Services.People.queryMyIdentities(twitterUrl.hostIdentifier),
                ])
                const myIdentity = myIdentities[0] || PersonIdentifier.unknown
                const myFirends = GroupIdentifier.getFriendsGroupIdentifier(
                    myIdentity.identifier,
                    PreDefinedVirtualGroupNames.friends,
                )
                const myFollowers = GroupIdentifier.getFriendsGroupIdentifier(
                    myIdentity.identifier,
                    PreDefinedVirtualGroupNames.followers,
                )
                const myFollowing = GroupIdentifier.getFriendsGroupIdentifier(
                    myIdentity.identifier,
                    PreDefinedVirtualGroupNames.following,
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
    const getTweetNode = (node: HTMLElement) => {
        return node.closest<HTMLDivElement>(
            [
                '.tweet', // timeline page for legacy twitter
                '.main-tweet', // detail page for legacy twitter
                'article > div', // new twitter
            ].join(),
        )
    }

    new MutationObserverWatcher(postsContentSelector())
        .useForeach((node, _, proxy) => {
            const tweetNode = getTweetNode(node)
            if (!tweetNode) return
            // noinspection JSUnnecessarySemicolon
            const info = getEmptyPostInfoByElement({
                get rootNode() {
                    return proxy.current
                },
                rootNodeProxy: proxy,
            })
            const collectPostInfo = async () => {
                if (!tweetNode) return
                const { pid, content, handle, name, avatar } = postParser(tweetNode)
                if (!pid) return
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

                // decode steganographic image
                untilElementAvailable(postsImageSelector(tweetNode), 10000)
                    .then(() => postImageParser(tweetNode))
                    .then(content => {
                        if (content && info.postContent.value.indexOf(content) < 0) {
                            info.postContent.value = content
                        }
                    })
                    .catch(() => {})
            }
            ;(async () => {
                await collectPostInfo()
                info.postPayload.value = deconstructPayload(info.postContent.value, self.payloadDecoder)
                info.postContent.addListener(newValue => {
                    info.postPayload.value = deconstructPayload(newValue, self.payloadDecoder)
                })
                self.posts.set(proxy, info)
            })()
            return {
                onTargetChanged: collectPostInfo,
                onRemove: () => self.posts.delete(proxy),
            }
        })
        .setDOMProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .assignKeys(node => {
            const tweetNode = getTweetNode(node)
            return tweetNode ? `${postIdParser(tweetNode)}${node.innerHTML}` : node.innerHTML
        })
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
