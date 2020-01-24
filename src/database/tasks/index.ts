import { cleanProfileWithNoLinkedPersona } from './clean-avatar-profile'
import { untilDocumentReady } from '../../utils/dom'

untilDocumentReady().then(() => {
    cleanProfileWithNoLinkedPersona()
})
