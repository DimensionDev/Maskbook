import React from 'react'
import { PersonaIdentifier } from '../../database/type'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import {
    ImmersiveSetupStepper,
    ImmersiveSetupStepperUIProps,
} from '../../components/InjectedComponents/ImmersiveSetup/Setup-Stepper'
import { DraggablePaper } from '../../components/InjectedComponents/ImmersiveSetup/DraggablePaper'
import Services from '../../extension/service'
import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { SocialNetworkUI } from '../ui'

function UI({ unmount, post }: { unmount: () => void; post: ValueRef<string> }) {
    const provePost = useValueRef(post)
    return (
        <DraggablePaper>
            <ImmersiveSetupStepper provePost={provePost} onClose={unmount}></ImmersiveSetupStepper>
        </DraggablePaper>
    )
}
export function createTaskStartImmersiveSetupDefault(
    _: () => SocialNetworkUI,
    props: Partial<ImmersiveSetupStepperUIProps> = {},
) {
    return (for_: PersonaIdentifier) => {
        const dom = document.createElement('span')
        const shadow = dom.attachShadow({ mode: 'closed' })
        document.body.appendChild(dom)
        const provePost = new ValueRef('')
        const unmount = renderInShadowRoot(<UI post={provePost} unmount={() => unmount()} />, shadow)
        Services.Crypto.getMyProveBio(for_, _().networkIdentifier)
            .then(x => x || '')
            .then(x => (provePost.value = x))
    }
}
