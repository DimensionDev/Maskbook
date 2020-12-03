import { PluginConfig, PluginStage, PluginScope } from '../types'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import { identifier, ITOMetaKey } from './constants'
import ITODialog from './UI/ITODialog'
import { ITOMetaData } from './types'

const [ITOCompositionEntry, ITOCompositionUI] = createCompositionDialog('ITO', (props) => (
    <ITODialog open={props.open} onConfirm={props.onClose} onDecline={props.onClose} />
))

export const ITOPluginDefine: PluginConfig = {
    pluginName: 'ITO',
    identifier: identifier,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    /*
    successDecryptionInspector: function Comp(props) {
        if (!RedPacketInspector(props.message.meta).ok) {
            return null
        }
        return <RedPacketInspector {...props} />
    },

*/
    postDialogMetadataBadge: new Map([
        [ITOMetaKey, (meta: ITOMetaData) => `a ito of '${meta.data}' from ${meta.sender}`],
    ]),
    PageComponent: ITOCompositionUI,
    postDialogEntries: [ITOCompositionEntry],
}
