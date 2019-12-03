import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit/es'
import { timeout } from '../../../utils/utils'

export async function getPostContentFacebook(): Promise<string> {
    const post = new LiveSelector().querySelector('#contentArea').getElementsByTagName('p')
    const [data] = await timeout(new MutationObserverWatcher(post), 10000)
    return data.innerText
}
