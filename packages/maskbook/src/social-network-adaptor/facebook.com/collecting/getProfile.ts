import { timeout } from '../../../utils/utils'
import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'

const bioCard = new LiveSelector().querySelector<HTMLDivElement>('#profile_timeline_intro_card')
export async function getProfileFacebook() {
    const [data] = await timeout(new MutationObserverWatcher(bioCard), 10000)
    return { bioContent: data.innerText }
}
