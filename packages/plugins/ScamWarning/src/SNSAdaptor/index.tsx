import type { Plugin } from '@masknet/plugin-infra'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { base } from '../base.js'
import { setupContext } from './context.js'
import { PreviewCard } from './components/PreviewCard.js'
import * as React from 'react'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    PostInspector() {
        const links = usePostInfoDetails.mentionedLinks()
        if (!links) return null
        return <PreviewCard links={links} />
    },
}

export default sns
