import { injectPostDialogAtMinds } from './PostDialog'
import { injectPostDialogHintAtMinds } from './PostDialogHint'

export function injectPostBoxComposed(signal: AbortSignal) {
    injectPostDialogAtMinds(signal)
    injectPostDialogHintAtMinds(signal)
}
