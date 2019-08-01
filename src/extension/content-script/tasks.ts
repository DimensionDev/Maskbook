import { AutomatedTabTask } from '@holoflows/kit'
import { getActivatedUI } from '../../social-network/ui'

export default AutomatedTabTask(
    {
        /**
         * Access post url
         * Get post content
         */
        getPostContent: getActivatedUI().taskGetPostContent,
        /**
         * Access profile page
         * Get Profile
         */
        getProfile: getActivatedUI().taskGetProfile,
        /**
         * Access profile page
         * Paste text into bio
         */
        pasteIntoBio: getActivatedUI().taskPasteIntoBio,
        /**
         * Access main page
         * Paste text into PostBox
         */
        pasteIntoPostBox: getActivatedUI().taskPasteIntoPostBox,
    },
    { memorable: true },
)!
