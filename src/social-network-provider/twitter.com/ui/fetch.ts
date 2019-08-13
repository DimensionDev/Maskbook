import { bioCard, userInfos } from '../utils/selectors'
import { MutationObserverWatcher } from '@holoflows/kit'
import Services from '../../../extension/service'
import { PersonIdentifier } from '../../../database/type'
import { host } from '../index'

let nodePointer: HTMLDivElement;
const locateUserInfo = () => {
    const text = nodePointer.innerText;
    const p = new PersonIdentifier(host, userInfos.userId!);
    Services.Crypto.verifyOthersProve(text, p).then();
    Services.People.updatePersonInfo(p, {
        nickname: userInfos.userName!,
        avatarURL: userInfos.userAvatar!
    }).then()
}

const registerPageChangeListener = () => {
    // This object will not be garbage collected
    new MutationObserverWatcher(bioCard)
        .enableSingleMode()
        .useForeach(node => {
            nodePointer = node;
            locateUserInfo()
            return {
                onNodeMutation: locateUserInfo,
                onTargetChanged: locateUserInfo
            }
        })
        .startWatch()
        .then()
}

export {registerPageChangeListener as collectPeople}
