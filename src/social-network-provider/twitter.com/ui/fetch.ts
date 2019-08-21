import {
    bioCard,
    postPopupSelector,
    postsContentSelectors,
    postsRootSelector,
    postsSelectors,
    postViewMain,
    selfInfoSelectors,
} from '../utils/selector'
import { MutationObserverWatcher } from '@holoflows/kit'
import Services from '../../../extension/service'
import { PersonIdentifier } from '../../../database/type'
import { host } from '../index'
import { getEmptyPostInfo, SocialNetworkUI } from '../../../social-network/ui'
import { deconstructPayload } from '../../../utils/type-transform/Payload'
import { MemoryLeakProbe } from '../../../utils/MemoryLeakProbe'
import { timeout } from '../../../utils/utils'
import { hasPostPopup } from '../utils/status'

const p = new MemoryLeakProbe()

export const resolveLastRecognizedIdentity = function(this: SocialNetworkUI) {
    p.shouldOnlyRunOnce()
    const ref = this.lastRecognizedIdentity
    ref.addListener(id => {
        if (id.identifier.isUnknown) return
        Services.People.resolveIdentity(id.identifier).then()
    })
    const self = selfInfoSelectors.screenName
    new MutationObserverWatcher(self)
        .enableSingleMode()
        .addListener('onAdd', () => assign())
        .addListener('onChange', () => assign())
        .startWatch()
        .then()
    const assign = () => {
        const i = new PersonIdentifier(host, selfInfoSelectors.screenName.evaluateOnce()[0])
        if (i.isUnknown) return
        if (i.equals(ref.value.identifier)) return
        ref.value = { identifier: i }
    }
}

export const resolveInfoFromBioCard = () => {
    const userAvatarUrl = bioCard
        .nth(0)
        .querySelector<HTMLImageElement>('img')
        .evaluateOnce()[0].src
    const userNames = bioCard
        .nth(1)
        .evaluateOnce()[0]
        .innerText.split('\n')
    const userBio = bioCard.nth(2).evaluateOnce()[0].innerText
    return {
        userAvatarUrl,
        userName: userNames[0],
        userScreenName: userNames[1],
        userBio,
    }
}

const registerBioCollector = () => {
    // This object will not be garbage collected
    new MutationObserverWatcher(bioCard)
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
        .then()
}

const resolveInfoFromPostView = () => {
    const c = postViewMain
        .querySelectorAll<HTMLElement>('[data-testid="tweet"] > div:nth-of-type(2) > div')
        .evaluateOnce()
    const postBy = c[0].querySelectorAll('span')[3].innerText.replace('@', '')
    const postContent = c[1].innerText
    return {
        postBy,
        postContent,
    }
}

const registerPostCollector = (that: SocialNetworkUI) => {
    new MutationObserverWatcher(postsSelectors)
        .useForeach((node, _, proxy) => {
            const info = getEmptyPostInfo(postsRootSelector)
            that.posts.set(proxy, info)
            const collectPostInfo = () => {
                const r = resolveInfoFromPostView()
                info.postContent.value = r.postContent
                info.postPayload.value = deconstructPayload(info.postContent.value)
                info.postBy.value = new PersonIdentifier(host, r.postBy)
                info.postID.value = ''
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
        .then()
}

/**
 * This can be help to make sure if bioCard exists on the page.
 * @throws exception if not exist
 * @return bioCard element, if exists
 */
export const fetchBioCard = async () => {
    return (await timeout(new MutationObserverWatcher(bioCard), 10000))[0]
}

export const fetchPost = async () => {
    const s = hasPostPopup() ? postPopupSelector.concat(postsContentSelectors) : postsContentSelectors
    return (await timeout(new MutationObserverWatcher(s), 10000))[0]
}

export { registerBioCollector as collectPeople, registerPostCollector as collectPosts }
