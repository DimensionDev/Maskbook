import React from 'react'
import { PersonaIdentifier } from '../../database/type'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import {
    ImmersiveSetupStepper,
    ImmersiveSetupStepperUIProps,
} from '../../components/InjectedComponents/ImmersiveSetup/Setup-Stepper'
import { DraggablePaper } from '../../components/InjectedComponents/ImmersiveSetup/DraggablePaper'

export function createTaskStartImmersiveSetupDefault(props: Partial<ImmersiveSetupStepperUIProps> = {}) {
    return (for_: PersonaIdentifier) => {
        const dom = document.createElement('span')
        const shadow = dom.attachShadow({ mode: 'closed' })
        document.body.appendChild(dom)
        renderInShadowRoot(
            <DraggablePaper>
                <ImmersiveSetupStepper></ImmersiveSetupStepper>
            </DraggablePaper>,
            shadow,
        )
    }
}
