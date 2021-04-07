import type { ProfileIdentifier, PostIdentifier } from '../../../database/type'
import { parseFacebookStaticHTML } from '../utils/parse-html'
import { getPostUrlAtFacebook } from '../utils/parse-username'
import tasks from '../../../extension/content-script/tasks'
import { timeout } from '../../../utils/utils'
import { getActiveTabFacebook } from '../../../utils/tabs'
import { isDocument } from '../../../utils/dom'

// ? We now always run fetch request from an active tab.
// ? If failed, we will fallback to open a new tab to do this.
export async function fetchPostContentFacebook(post: PostIdentifier<ProfileIdentifier>): Promise<string> {
    const activeTabID = await getActiveTabFacebook()
    if (activeTabID !== undefined) {
        // Path 1: fetch by http req
        const url = getPostUrlAtFacebook(post)
        const { memoizeFetch } = tasks(activeTabID)
        const html = await timeout(memoizeFetch(url), 10000).catch((_) => null)
        if (html !== null) {
            try {
                const doc = parseFacebookStaticHTML(html)
                if (doc.length) return doc.map((x) => (isDocument(x) ? x.body : x).innerText).join('')
            } catch (e) {
                console.warn(e)
                memoizeFetch.cache?.delete(url)
            }
        }
    }

    // Path 2: fetch by tab task
    return tasks(getPostUrlAtFacebook(post)).getPostContent()
}
