import type { Plugin } from '@masknet/plugin-infra'
import { usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { base } from '../base.js'
import { setupContext } from './context.js'
import { PreviewCard } from './components/PreviewCard.js'
import { Icons } from '@masknet/icons'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    PostInspector() {
        const links = usePostInfoDetails.mentionedLinks()
        if (!links) return null
        return <Renderer links={links} />
    },
    wrapperProps: {
        icon: <Icons.ApplicationNFT size={24} />,
        backgroundGradient: 'rgba(255, 235, 237)',
    },
}

function Renderer(
    props: React.PropsWithChildren<{
        links: string[]
    }>,
) {
    usePluginWrapper(true)
    return <PreviewCard links={props.links} />
}

export default sns
