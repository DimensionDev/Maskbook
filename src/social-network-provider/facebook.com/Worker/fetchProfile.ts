import { PersonIdentifier } from '../../../database/type'
import { getProfilePageUrlAtFacebook } from '../parse-username'
import { parseFacebookStaticHTML } from '../parse-html'
import { Profile } from '../../../social-network/shared'
import tasks from '../../../extension/content-script/tasks'
import { timeout } from '../../../utils/utils'

// ? We now always run fetch request from an active tab.
// ? If failed, we will fallback to open a new tab to do this.
export async function fetchProfileFacebook(who: PersonIdentifier): Promise<Profile> {
    const activeTabID = await getActiveTab()
    if (activeTabID) {
        try {
            const url = getProfilePageUrlAtFacebook(who, 'fetch')
            const html = await timeout(tasks(activeTabID).fetch(url), 5000)
            // Path 1: fetch by http req
            const doc = parseFacebookStaticHTML(html)
            if (!doc.length) throw new Error("Can't parse the page")
            const bio = doc
                .map(
                    doc =>
                        doc.querySelector<HTMLDivElement>('#intro_container_id') ||
                        doc.querySelector<HTMLDivElement>('#bio') ||
                        doc.querySelector<HTMLDivElement>('div > div > div:nth-child(2) > div:nth-child(2)'),
                )
                .map(x => x && x.innerText)
                .join('')
            if (!bio.indexOf('🔒')) throw new Error("Can't find bio")
            return { bioContent: bio }
        } catch (e) {
            console.log(e)
        }
    } else {
        // Open a new tab in the background
        tasks(getProfilePageUrlAtFacebook(who, 'open'), {
            runAtTabID: activeTabID,
        }).getProfile(who)
    }

    // const tabID = await getActiveTab
    // Path 2: fetch by tab task
    // TODO: on iOS, this should run the Path 1 in the domain of m.facebook.com
    // const tabId = await getActiveTab()
    return tasks(getProfilePageUrlAtFacebook(who, 'open'), {
        // runAtTabID: tabId
    }).getProfile(who)
}

async function getActiveTab() {
    const [tab] = await browser.tabs.query({
        url: ['https://www.facebook.com/*', 'https://m.facebook.com/*'],
        pinned: false,
    })
    if (tab) return tab.id
    return undefined
}
