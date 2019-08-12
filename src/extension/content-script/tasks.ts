import { AutomatedTabTask } from '@holoflows/kit'
import { getActivatedUI } from '../../social-network/ui'
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
        pasteIntoPostBox: async (text: string, warningText: string) =>
            getActivatedUI().taskPasteIntoPostBox(text, warningText),
    },
    { memorable: true },
)!
