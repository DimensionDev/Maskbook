import { bioCard, postsRootSelector, postsSelectors, selfInfos } from '../utils/selectors'
import { MutationObserverWatcher } from '@holoflows/kit'
import Services from '../../../extension/service'
import { PersonIdentifier } from '../../../database/type'
import { host } from '../index'
import { getEmptyPostInfo, SocialNetworkUI } from '../../../social-network/ui'
import { deconstructPayload } from '../../../utils/type-transform/Payload'

const registerBioCollector = () => {
    // This object will not be garbage collected
    new MutationObserverWatcher(bioCard)
        .enableSingleMode()
        .useForeach(node => {
            const refreshUserInfo = () => {
                const text = node.innerText
                const p = new PersonIdentifier(host, selfInfos.screenName!)
                Services.Crypto.verifyOthersProve(text, p).then()
                Services.People.updatePersonInfo(p, {
                    nickname: selfInfos.userName!,
                    avatarURL: selfInfos.userAvatar!,
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
