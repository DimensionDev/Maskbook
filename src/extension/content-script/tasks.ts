import { AutomatedTabTask } from '@holoflows/kit'
import { getActivatedUI, SocialNetworkUI } from '../../social-network/ui'
import { PersonIdentifier, PostIdentifier } from '../../database/type'
import { disableOpenNewTabInBackgroundSettings } from '../../components/shared-settings/settings'

const tasks = AutomatedTabTask(
    {
        /**
         * Access post url
         * Get post content
         */
        getPostContent: (postIdentifier: PostIdentifier<PersonIdentifier>) =>
            getActivatedUI().taskGetPostContent(postIdentifier),
        /**
         * Access profile page
         * Get Profile
         */
        getProfile: (identifier: PersonIdentifier) => getActivatedUI().taskGetProfile(identifier),
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
        async fetch(url: string) {
            return fetch(url).then(x => x.text())
        },
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
