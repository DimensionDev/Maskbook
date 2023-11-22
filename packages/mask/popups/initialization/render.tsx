import { createNormalReactRoot } from '../../shared-ui/utils/createNormalReactRoot.js'
import Popups from '../Popup.js'
import { setupUIContext } from '../../shared-ui/initUIContext.js'

setupUIContext()
if (location.hash === '') location.assign('#/personas')

/**
 * Firefox will not help popup fixed width when user click browser action
 * So this will determine if the user has set maxWidth to 'unset' when resizing in the window
 */
if (navigator.userAgent.includes('Firefox')) {
    setTimeout(() => {
        document.body.style.maxWidth = '350px'

        window.addEventListener(
            'resize',
            () => {
                if (window.innerWidth !== 400) {
                    document.body.style.maxWidth = 'unset'
                }
            },
            { once: true },
        )
    }, 200)
}
createNormalReactRoot(<Popups />)
