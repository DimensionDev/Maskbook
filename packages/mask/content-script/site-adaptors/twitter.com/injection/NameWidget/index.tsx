import { injectNameWidgetOnPost } from './injectNameWidgetOnPost.js'
import { injectNameWidgetProfile } from './injectNameWidgetOnProfile.js'
import { injectNameWidgetOnUserCell } from './injectNameWidgetOnSidebar.js'

export function injectNameWidget(signal: AbortSignal) {
    injectNameWidgetOnPost(signal)
    injectNameWidgetProfile(signal)
    injectNameWidgetOnUserCell(signal)
}
