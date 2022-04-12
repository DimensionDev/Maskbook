import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import PluginDialog from './PluginDialog'
import { HelloWorld } from '../Components'
import { PollMetadataReader } from '../helpers'
import { META_KEY_1, META_KEY_2 } from '../constants'
import MaskPluginWrapper from '../../../../mask/src/plugins/MaskPluginWrapper'
// const { attachMetadata, dropMetadata } = useCompositionContext()
// import { useCompositionContext } from '@masknet/plugin-infra'

//in decryptor need to validate schema so that our plugin will render correctly

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {
        console.debug('Example plugin has been loaded.')
        signal.addEventListener('abort', () => console.debug('Example plugin has been terminated'))
    },
    // PostInspector: function Component(props) {
    //     console.log('usePostInfoDetails=', usePostInfoDetails)
    //     const info = usePostInfoDetails.postPayload()
    //     const postBy = usePostInfoDetails.postBy()

    //     return (
    //         <MaskPluginWrapper pluginName="Trader XYZ">
    //             <div>
    //                 <pre>New data collection={JSON.stringify(postBy, null, 7)}</pre>
    //             </div>
    //         </MaskPluginWrapper>
    //     )
    // },
    // SearchBoxComponent: HelloWorld,
    DecryptedInspector: function Comp(props) {
        const metadata = PollMetadataReader(props.message.meta)
        console.log('metadata=', props.message.meta)
        console.log('metadata-result=', metadata)
        if (!metadata.ok) return null
        return (
            <MaskPluginWrapper pluginName="Trader XYZ">
                <HelloWorld info={metadata.val} {...props} />
            </MaskPluginWrapper>
        )
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [META_KEY_1, onAttachedFile],
        [META_KEY_2, onAttachedFile],
    ]),
    // GlobalInjection: GlobalComponent,
    CompositionDialogEntry: {
        label: { i18nKey: '__entry__', fallback: '🤔 Example' },
        dialog: PluginDialog,
    },
    // CompositionDialogEntry: {
    //     label: '🤣 Example Dialog',
    //     dialog: PluginDialog,
    // },
}

export default sns

function onAttachedFile() {
    return `Trader XYZ done`
}
