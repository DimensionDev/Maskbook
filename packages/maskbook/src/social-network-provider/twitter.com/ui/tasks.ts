import type { SocialNetworkUITasks } from '../../../social-network/ui'
import { createTaskStartSetupGuideDefault } from '../../../social-network/defaults/taskStartSetupGuideDefault'
import { pasteTextToCompositionTwitter } from '../automation/pasteTextToComposition'
import { openComposeBoxTwitter } from '../automation/openComposeBox'
import { uploadToPostBoxTwitter } from '../automation/uploadToPostBox'
import { getPostContentTwitter } from '../collecting/getPostContent'
import { getProfileTwitter } from '../collecting/getProfile'
import { gotoProfilePageTwitter } from '../automation/gotoProfilePage'
import { gotoNewsFeedPageTwitter } from '../automation/gotoNewsFeedPage'
export const twitterUITasks: SocialNetworkUITasks = {
    taskPasteIntoPostBox: pasteTextToCompositionTwitter,
    taskOpenComposeBox: openComposeBoxTwitter,
    taskUploadToPostBox: uploadToPostBoxTwitter,
    taskGetPostContent: getPostContentTwitter,
    taskGetProfile: getProfileTwitter,
    taskGotoProfilePage: gotoProfilePageTwitter,
    taskGotoNewsFeedPage: gotoNewsFeedPageTwitter,
    taskStartSetupGuide: createTaskStartSetupGuideDefault('twitter.com'),
}
