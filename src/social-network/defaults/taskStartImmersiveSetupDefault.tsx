import React from 'react'
import { PersonaIdentifier, ECKeyIdentifier } from '../../database/type'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import {
    ImmersiveSetupStepper,
    ImmersiveSetupStepperUIProps,
} from '../../components/InjectedComponents/ImmersiveSetup/SetupStepper'
import { DraggableDiv } from '../../components/InjectedComponents/ImmersiveSetup/DraggableDiv'
import Services from '../../extension/service'
import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { SocialNetworkUI } from '../ui'
import { restorePrototype } from '../../utils/type'

function UI({
    post,
    unmount,
    persona,
    ...rest
}: { unmount: () => void; post: ValueRef<string>; persona: PersonaIdentifier } & Partial<
    ImmersiveSetupStepperUIProps
>) {
    const provePost = useValueRef(post)
    return (
        <DraggableDiv>
            <ImmersiveSetupStepper
                persona={persona}
                provePost={provePost}
                onClose={unmount}
                {...rest}></ImmersiveSetupStepper>
        </DraggableDiv>
    )
}
let mounted = false
export function createTaskStartImmersiveSetupDefault(
    _: () => SocialNetworkUI,
    props: Partial<ImmersiveSetupStepperUIProps> = {},
) {
    return (for_: PersonaIdentifier) => {
        if (mounted) return
        mounted = true
        const dom = document.createElement('span')
        document.body.appendChild(dom)
        const provePost = new ValueRef('')
        const unmount = renderInShadowRoot(
            <UI
                persona={for_}
                post={provePost}
                unmount={() => {
                    unmount()
                    mounted = false
                }}
            />,
            {
                shadow: () => dom.attachShadow({ mode: 'closed' }),
                normal: () => dom,
            },
        )
        Services.Crypto.getMyProveBio(for_, _().networkIdentifier)
            .then((x) => x || '')
            .then((x) => (provePost.value = x))
    }
}
