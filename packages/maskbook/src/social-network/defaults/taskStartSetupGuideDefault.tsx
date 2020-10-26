import React from 'react'
import type { PersonaIdentifier } from '../../database/type'
import { renderInShadowRoot } from '../../utils/shadow-root/renderInShadowRoot'
import Services from '../../extension/service'
import { ValueRef } from '@dimensiondev/holoflows-kit/es'
import type { SocialNetworkUI } from '../ui'
import { SetupGuide, SetupGuideProps } from '../../components/InjectedComponents/SetupGuide'
import { Flags } from '../../utils/flags'

function UI({ unmount, persona }: { unmount: () => void; persona: PersonaIdentifier } & Partial<SetupGuideProps>) {
    return <SetupGuide persona={persona} onClose={unmount} />
}
let mounted = false
export function createTaskStartSetupGuideDefault(_: () => SocialNetworkUI, props: Partial<SetupGuideProps> = {}) {
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
                unmount={() => {
                    unmount()
                    mounted = false
                }}
            />,
            {
                shadow: () => {
                    if (!shadowRoot) {
                        shadowRoot = dom.attachShadow({ mode: Flags.using_ShadowDOM_attach_mode })
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
