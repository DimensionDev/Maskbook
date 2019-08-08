import { SocialNetworkUI } from '../../../social-network/ui'
import Services from '../../../extension/service'
import { MemoryLeakProbe } from '../../../utils/MemoryLeakProbe'
import { MutationObserverWatcher } from '@holoflows/kit'
import { screenNameSelector } from '../utils/selectors'
import { PersonIdentifier } from '../../../database/type'

const p = new MemoryLeakProbe()

export const resolveLastRecognizedIdentity = function(this: SocialNetworkUI) {
    p.shouldOnlyRunOnce()
    const ref = this.lastRecognizedIdentity
    ref.addListener(id => {
        if (id.identifier.isUnknown) return
        Services.People.resolveIdentity(id.identifier).then()
    })
    new MutationObserverWatcher(screenNameSelector)
        .enableSingleMode()
        .addListener('onAdd', e => assign(e.value))
        .addListener('onChange', e => assign(e.newValue))
        .startWatch()
        .then()
    const assign = (i: PersonIdentifier) => {
        if (i.isUnknown) return
        if (i.equals(ref.value.identifier)) return
        ref.value = {identifier: i}
    }
}
