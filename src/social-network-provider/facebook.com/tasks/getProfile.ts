import { PersonIdentifier } from '../../../database/type'
import { ProfileUI } from '../../../social-network/shared'
import { timeout } from '../../../utils/utils'
import { MutationObserverWatcher, LiveSelector } from '@holoflows/kit/es'

const bioCard = new LiveSelector().querySelector<HTMLDivElement>('#profile_timeline_intro_card')
export async function getProfileFacebook(identifier: PersonIdentifier): Promise<ProfileUI> {
    const [data] = await timeout(new MutationObserverWatcher(bioCard), 10000)
    return { bioContent: data.innerText }
}
