import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { parseFacebookStaticHTML } from '../parse-html'
import { getPostUrlAtFacebook } from '../parse-username'
import tasks from '../../../extension/content-script/tasks'
import { isDocument } from '../../../utils/utils'

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
        const doc = await parseFacebookStaticHTML(getPostUrlAtFacebook(post, 'fetch'))
        if (!doc) throw new Error("Can't parse the page")
        // TODO: You should take care about the key comes from.
        //  If some one commented a key under a normal post,
        //  it will be a false-positive and it is dangerous.
        //  There is a build-in parser.
        //  Checkout http://mdn.io/DOMParser and we're already using it.
        const content = (isDocument(doc) ? doc.body : doc).innerText.match(/(🔒.+🔒)/)
        if (content && content[0].length) return content[0]
        throw new Error('Not found in post')
    } catch (e) {
        console.log(e)
    }

    // Path 2: fetch by tab task
    // TODO: on iOS, this should run the Path 1 in the domain of m.facebook.com
    // const tabId = await getActiveTab()
    return tasks(getPostUrlAtFacebook(post, 'open'), {
        // runAtTabID: tabId,
    }).getPostContent(post)
}

async function getActiveTab() {
    const [tab] = await browser.tabs.query({ active: true })
    if (tab) return tab.id
    return undefined
}
