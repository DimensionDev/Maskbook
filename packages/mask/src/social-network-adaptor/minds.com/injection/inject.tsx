import { injectPostDialogAtMinds } from './PostDialog.js'
import { injectPostDialogHintAtMinds } from './PostDialogHint.js'

export function injectPostBoxComposed(signal: AbortSignal) {
    injectPostDialogAtMinds(signal)
    injectPostDialogHintAtMinds(signal)
}
