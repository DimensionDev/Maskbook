import { cleanProfileWithNoLinkedPersona } from './clean-avatar-profile'
import { untilDocumentReady } from '../../utils/dom'
import { sideEffect } from '../../utils/side-effects'

sideEffect.then(untilDocumentReady).then(() => {
    cleanProfileWithNoLinkedPersona()
})
