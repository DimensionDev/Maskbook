import { AutomatedTabTask } from '@holoflows/kit'
import { getActivatedUI, SocialNetworkUI } from '../../social-network/ui'
import { PersonIdentifier, PostIdentifier } from '../../database/type'

export default AutomatedTabTask(
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
