import { postPopupSelector } from './selector'
import { isNil } from 'lodash-es'

export const hasPostPopup = () => {
    return !!isNil(postPopupSelector().evaluate())
}
