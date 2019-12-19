import { AutomatedTabTask } from '@holoflows/kit'
import { ProfileIdentifier } from '../../database/type'
import { disableOpenNewTabInBackgroundSettings } from '../../components/shared-settings/settings'
import { SocialNetworkUI } from '../../social-network/ui'
import { memoizePromise } from '../../utils/memoize'
import { safeGetActiveUI } from '../../utils/safeRequire'

function getActivatedUI() {
    return safeGetActiveUI()
}

const tasks = AutomatedTabTask(
    {
        /**
         * Access post url
         * Get post content
         */
        getPostContent: () => getActivatedUI().taskGetPostContent(),
        /**
         * Access profile page
         * Get Profile
         */
        getProfile: (identifier: ProfileIdentifier) => getActivatedUI().taskGetProfile(identifier),
        /**
         * Access profile page
         * Paste text into bio
         */
        pasteIntoBio: async (text: string) => getActivatedUI().taskPasteIntoBio(text),
        /**
         * Access main page
         * Paste text into PostBox
         */
        pasteIntoPostBox: async (text: string, options: Parameters<SocialNetworkUI['taskPasteIntoPostBox']>[1]) =>
            getActivatedUI().taskPasteIntoPostBox(text, options),
        /**
         * Fetch a url in the current context
         */
        async fetch(...args: Parameters<typeof fetch>) {
            return fetch(...args).then(x => x.text())
        },
        memoizeFetch: memoizePromise(
            url => {
                return fetch(url).then(x => x.text())
            },
            x => x,
        ),
    },
    { memorable: true },
)!
export default function tasksMocked(...args: Parameters<typeof tasks>) {
    const [tabIdOrUri, options] = args
    if (disableOpenNewTabInBackgroundSettings.value && Number.isNaN(Number(tabIdOrUri))) {
        if (!options || !options.active)
            throw new Error(
                `You have disabled "Disable fetching public keys in the background" in the settings so Maskbook can not perform this action`,
            )
    }
    return tasks(...args)
}
