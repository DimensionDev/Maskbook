import { injectPostDialogAtTwitter } from './PostDialog'
import { injectPostDialogHintAtTwitter } from './PostDialogHint'
import { injectPostDialogIconAtTwitter } from './PostDialogIcon'

export function injectPostBoxComposed(signal: AbortSignal) {
    injectPostDialogAtTwitter(signal)
    injectPostDialogHintAtTwitter(signal)
    injectPostDialogIconAtTwitter(signal)
}
