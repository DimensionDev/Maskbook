import React from 'react'
import type { PersonaIdentifier } from '../../database/type'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { Draggable } from '../../components/InjectedComponents/ImmersiveGuide/Draggable'
import Services from '../../extension/service'
import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import type { SocialNetworkUI } from '../ui'
import { SetupGuide, SetupGuideProps } from '../../components/InjectedComponents/ImmersiveGuide/SetupGuide'

function UI({
    post,
    unmount,
    persona,
    ...rest
}: { unmount: () => void; post: ValueRef<string>; persona: PersonaIdentifier } & Partial<SetupGuideProps>) {
    const provePost = useValueRef(post)
    return (
        <Draggable>
            <SetupGuide persona={persona} provePost={provePost} onClose={unmount}></SetupGuide>
        </Draggable>
    )
}
let mounted = false
export function createTaskStartImmersiveSetupDefault(_: () => SocialNetworkUI, props: Partial<SetupGuideProps> = {}) {
    let shadowRoot: ShadowRoot
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
                shadow: () => {
                    if (!shadowRoot) {
                        shadowRoot = dom.attachShadow({ mode: 'closed' })
                    }
                    return shadowRoot
                },
                normal: () => dom,
            },
        )
        Services.Crypto.getMyProveBio(for_, _().networkIdentifier)
            .then((x) => x || '')
            .then((x) => (provePost.value = x))
    }
}
