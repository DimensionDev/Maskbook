import { injectLensOnPost } from './injectLensOnPost.js'
import { injectLensOnProfile } from './injectLensOnProfile.js'
import { injectLensOnUserCell } from './injectLensOnUserCell.js'

export function injectLens(signal: AbortSignal) {
    injectLensOnProfile(signal)
    injectLensOnPost(signal)
    injectLensOnUserCell(signal)
}
