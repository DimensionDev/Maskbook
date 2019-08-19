import { postPopupSelector } from './selector'

export const hasPostPopup = () => {
    return !!postPopupSelector.evaluateOnce().length
}
