import {
    bioCard,
    fromPostSelectorsSelectPostContentString,
    postsRootSelector,
    postsSelectors,
    selfInfoSelectors,
} from '../utils/selector'
import { MutationObserverWatcher } from '@holoflows/kit'
import Services from '../../../extension/service'
import { PersonIdentifier } from '../../../database/type'
import { host } from '../index'
import { getEmptyPostInfo, SocialNetworkUI, SocialNetworkUIInformationCollector } from '../../../social-network/ui'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import { regexMatch } from '../../../utils/utils'
import { equal, notEmpty } from '../../../utils/assert'
import { instanceOfTwitterUI } from './index'
import { resolveInfoFromBioCard } from '../utils/fetch'

const resolveLastRecognizedIdentity = (self: SocialNetworkUI) => {
    const selfSelector = selfInfoSelectors().screenName
    const assign = () => {
        try {
            const ref = self.lastRecognizedIdentity
            const info = selfInfoSelectors().screenName.evaluate()
            const id = new PersonIdentifier(host, notEmpty(info, 'user id not found')[0])
            equal(id.isUnknown, false, 'user id not recognized')
            ref.value = { identifier: id }
        } catch (e) {
            /**
             * TODO:
             *  This function expects to fail to collect info,
             *  maybe don't throw is a good idea
             *                                  -- Jack-Works
             */
            console.log(e)
        }
    }
    new MutationObserverWatcher(selfSelector)
        .enableSingleMode()
        .addListener('onAdd', () => assign())
        .addListener('onChange', () => assign())
        .startWatch()
        .then()
}

const registerBioCollector = () => {
    // This object will not be garbage collected
    // noinspection JSIgnoredPromiseFromCall
    new MutationObserverWatcher(bioCard())
        .enableSingleMode()
        .useForeach(node => {
            const refreshUserInfo = () => {
                const r = resolveInfoFromBioCard()
                const text = node.innerText
                const p = new PersonIdentifier(host, r.userScreenName)
                Services.Crypto.verifyOthersProve(text, p).then()
                Services.People.updatePersonInfo(p, {
                    nickname: r.userName,
                    avatarURL: r.userAvatarUrl,
                }).then()
            }
            refreshUserInfo()
            return {
                onNodeMutation: refreshUserInfo,
                onTargetChanged: refreshUserInfo,
            }
        })
        .startWatch()
}

const resolveInfoFromPostView = (node: HTMLElement) => {
    const r = node.querySelector(fromPostSelectorsSelectPostContentString)
    if (!r) return null
    const c = r.children
    const postId = regexMatch(c[0].querySelectorAll('a')[1].href, /(status\/)(\d*)/, 1)
    const postBy = c[0].querySelectorAll('span')[3].innerText.replace('@', '')
    const postContent = (c[1] as HTMLElement).innerText
    return {
        postId,
        postBy,
        postContent,
    }
}

const registerPostCollector = (that: SocialNetworkUI) => {
    // noinspection JSIgnoredPromiseFromCall
    new MutationObserverWatcher(postsSelectors())
        .useForeach((node, _, proxy) => {
            const info = getEmptyPostInfo(postsRootSelector())
            that.posts.set(proxy, info)
            const collectPostInfo = () => {
                const r = resolveInfoFromPostView(node)
                if (!r) return
                info.postContent.value = r.postContent
                info.postPayload.value = deconstructPayload(info.postContent.value)
                info.postBy.value = new PersonIdentifier(host, r.postBy)
                info.postID.value = r.postId
            }
            collectPostInfo()
            return {
                onNodeMutation: collectPostInfo,
                onTargetChanged: collectPostInfo,
                onRemove: () => that.posts.delete(proxy),
            }
        })
        .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch()
}

export const twitterUIFetch: SocialNetworkUIInformationCollector = {
    resolveLastRecognizedIdentity: () => resolveLastRecognizedIdentity(instanceOfTwitterUI),
    collectPeople: registerBioCollector,
    collectPosts: () => registerPostCollector(instanceOfTwitterUI),
}
