import React from 'react'
import { enable } from './DOMImpl'
import { t } from 'ef.js'
import { setupPortalShadowRoot } from '@dimensiondev/maskbook-shared'
setupPortalShadowRoot({ mode: 'open' }, [])

Object.assign(globalThis, { React })
enable()

const HelloWorld = t`
>mask-card
    %caption = Caption!
    %title = This is preview of id {{payload.id}}
    %button = Details
    >mask-card
        %caption = Caption!
        %title = This is preview of id {{payload.id}}
        %button = Details
`

const ins = new HelloWorld()
console.log('ins = ', ((globalThis as any).ins = ins))
ins.$mount({ target: document.body })
// will be set by Mask
ins.$data.payload = {
    id: 1,
}

export {}
