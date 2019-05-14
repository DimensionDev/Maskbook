import { LiveSelector } from '@holoflows/kit/es/DOM/LiveSelector'
import { MutationObserverWatcher } from '@holoflows/kit/es/DOM/Watchers/MutationObserverWatcher'
import Services from '../../service'

const bio = new LiveSelector().querySelector<HTMLDivElement>('#profile_timeline_intro_card')
function verify(text: string) {
    const a = document.querySelector<HTMLAnchorElement>('#fb-timeline-cover-name a')
    if (!text || !a) return
    const id = a.href.match(/profile\.php\?id=(.+)/)
    const name = a.href.match(/^https:..www.facebook.com\/(.+)/)
    if (!id && !name) return
    const username = id ? id[1] : name![1]
    Services.Crypto.verifyOthersProve(text, username)
}
new MutationObserverWatcher(bio)
    .useNodeForeach(node => {
        verify(node.current.innerText)
        return {
            onNodeMutation() {
                verify(node.current.innerText)
            },
            onTargetChanged() {
                verify(node.current.innerText)
            },
        }
    })
    .startWatch()
