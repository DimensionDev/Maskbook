import type { SocialNetworkUITasks } from '../../../social-network/ui'
import { createTaskStartSetupGuideDefault } from '../../../social-network/defaults/taskStartSetupGuideDefault'
import { pasteTextToCompositionTwitter } from './pasteTextToComposition'
import { openComposeBoxTwitter } from './openComposeBox'
import { uploadToPostBoxTwitter } from './uploadToPostBox'
import { getPostContentTwitter } from '../collecting/getPostContent'
import { getProfileTwitter } from '../collecting/getProfile'
import { gotoProfilePageTwitter } from './gotoProfilePage'
import { gotoNewsFeedPageTwitter } from './gotoNewsFeedPage'
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
