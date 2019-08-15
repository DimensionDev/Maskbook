import { bioCard, postsRootSelector, postsSelectors } from '../utils/selectors'
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

// Tinyfool\n@tinyfool\n·\n10m\n你们觉得用Xcode开发swift-ui，Xcode慢么？
const registerPostCollector = (that: SocialNetworkUI) => {
    new MutationObserverWatcher(postsSelectors)
        .useForeach((node, _, proxy) => {
            const info = getEmptyPostInfo(postsRootSelector)
            that.posts.set(proxy, info)
            const collectPostInfo = () => {
                info.postContent.value = node.innerText
                info.postPayload.value = deconstructPayload(info.postContent.value)
                info.postBy.value = new PersonIdentifier(host, )
            }
        })
        .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch()
        .then()
}

export { registerBioCollector as collectPeople }
