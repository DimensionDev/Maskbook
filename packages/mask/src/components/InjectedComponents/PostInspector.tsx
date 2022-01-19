import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { PossiblePluginSuggestionPostInspector } from './DisabledPluginSuggestion'

const PluginHooksRenderer = createInjectHooksRenderer(
    useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.PostInspector,
)

export function PostInspector() {
    const postBy = usePostInfoDetails.author()

    return (
        <>
            {process.env.NODE_ENV === 'development' && postBy.isUnknown ? (
                <h2 style={{ background: 'red', color: 'white' }}>Please fix me. Post author is $unknown</h2>
            ) : null}
            <PossiblePluginSuggestionPostInspector />
            <PluginHooksRenderer />
        </>
    )
}
