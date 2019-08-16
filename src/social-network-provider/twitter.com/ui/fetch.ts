import { bioCard, postsRootSelector, postsSelectors, postViewMain } from '../utils/selectors'
import { MutationObserverWatcher } from '@holoflows/kit'
import Services from '../../../extension/service'
import { PersonIdentifier } from '../../../database/type'
import { host } from '../index'
import { getEmptyPostInfo, SocialNetworkUI } from '../../../social-network/ui'
import { deconstructPayload } from '../../../utils/type-transform/Payload'

const resolveInfoFromBioCard = () => {
    const userAvatarUrl = bioCard.nth(0).querySelector<HTMLImageElement>('img').evaluateOnce()[0].src
    const userNames = bioCard.nth(1).evaluateOnce()[0].innerText.split('\n')
    const userBio = bioCard.nth(2).evaluateOnce()[0].innerText
    return {
        userAvatarUrl,
        userName: userNames[0],
        userScreenName: userNames[1],
        userBio
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
    const c = postViewMain.querySelectorAll<HTMLElement>('[data-testid="tweet"] > div:nth-of-type(2) > div').evaluateOnce()
    const postBy = c[0].querySelectorAll('span')[3].innerText.replace('@', '')
    const postContent = c[1].innerText
    return {
        postBy,
        postContent
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
                onRemove: () => that.posts.delete(proxy)
            }
        })
        .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch()
        .then()
}

export {
    registerBioCollector as collectPeople,
    registerPostCollector as collectPosts
}
