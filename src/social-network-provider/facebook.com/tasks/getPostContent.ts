import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit/es'
import { timeout } from '../../../utils/utils'
export async function getPostContentFacebook(identifier: PostIdentifier<PersonIdentifier>): Promise<string> {
    const post = new LiveSelector().querySelector('#contentArea').getElementsByTagName('p')
    const [data] = await timeout(new MutationObserverWatcher(post), 10000)
    return data.innerText
}
