import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { timeout } from '../../../utils/utils'

const postContent = new LiveSelector().querySelector<HTMLElement>('[data-ad-preview="message"]')
export async function getPostContentFacebook(): Promise<string> {
    return get(postContent)
}
async function get(post: LiveSelector<HTMLElement>) {
    const [data] = await timeout(new MutationObserverWatcher(post), 10000)
    return data.innerText
}
