import { PostIdentifier, PersonIdentifier } from '../../../database/type'
import { parseFacebookStaticHTML } from '../parse-html'
import { getPostUrlAtFacebook } from '../parse-username'
import tasks from '../../../extension/content-script/tasks'

// ? Try to execute query in the extension environment
// ? If it is the true extension environment (Chrome, Firefox, GeckoView)
// ? Will go through this path
// ? If it it the fake extension environment (Webview on iOS)
// ? this will fail due to cross-origin restriction.

// ? if failed
// ? we go to the old way.
// ? Invoke a task on the current activating page.
export async function fetchPostContentFacebook(post: PostIdentifier<PersonIdentifier>) {
    // Path 1: fetch by http req
    try {
        const doc = await parseFacebookStaticHTML(getPostUrlAtFacebook(post))
        if (!doc) throw new Error("Can't parse the page")
        const content = doc.body.innerText.match(/(🔒.+🔒)/)
        if (content && content[0].length) return content[0]
        throw new Error('Not found in post')
    } catch (e) {
        console.log(e)
    }

    // Path 2: fetch by tab task
    // TODO: on iOS, this should run the Path 1 in the domain of m.facebook.com
    // const tabId = await getActiveTab()
    return tasks(getPostUrlAtFacebook(post), {
        // runAtTabID: tabId,
    }).getPostContent(post)
}

async function getActiveTab() {
    const [tab] = await browser.tabs.query({ active: true })
    if (tab) return tab.id
    return undefined
}
