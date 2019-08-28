import { PersonIdentifier } from '../../../database/type'
import { getProfilePageUrlAtFacebook } from '../parse-username'
import { parseFacebookStaticHTML } from '../parse-html'
import { Profile } from '../../../social-network/shared'
import tasks from '../../../extension/content-script/tasks'

// ? Try to execute query in the extension environment
// ? If it is the true extension environment (Chrome, Firefox, GeckoView)
// ? Will go through this path
// ? If it it the fake extension environment (Webview on iOS)
// ? this will fail due to cross-origin restriction.

// ? if failed
// ? we go to the old way.
// ? Invoke a task on the current activating page.
export async function fetchProfileFacebook(who: PersonIdentifier): Promise<Profile> {
    // Path 1: fetch by http req
    try {
        const url = getProfilePageUrlAtFacebook(who, 'fetch')
        const doc = await parseFacebookStaticHTML(url)
        if (!doc) throw new Error("Can't parse the page")
        const bio =
            doc.querySelector<HTMLDivElement>('#bio') ||
            doc.querySelector<HTMLDivElement>('div > div > div:nth-child(2) > div:nth-child(2)')
        if (!bio) throw new Error("Can't find bio")
        return { bioContent: bio.innerText }
    } catch (e) {
        console.log(e)
    }

    // Path 2: fetch by tab task
    // TODO: on iOS, this should run the Path 1 in the domain of m.facebook.com
    // const tabId = await getActiveTab()
    return tasks(getProfilePageUrlAtFacebook(who, 'open'), {
        // runAtTabID: tabId
    }).getProfile(who)
}

async function getActiveTab() {
    const [tab] = await browser.tabs.query({ active: true })
    if (tab) return tab.id
    return undefined
}
