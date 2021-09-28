import type { Plugin } from '@masknet/plugin-infra'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { base } from '../base'
import { AirdropMetadataReader } from '../helpers'
import { Airdrop } from './Airdrop'
import type { AirdropJSONPayload } from '../types'
import { PLUGIN_NAME, PLUGIN_META_KEY } from '../constants'
import { CompositionDialog } from './CompositionDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp(props) {
        const payload = AirdropMetadataReader(props.message.meta)
        if (!payload.ok) return null
        return (
            <MaskPluginWrapper pluginName={PLUGIN_NAME}>
                <Airdrop payload={payload.val} />
            </MaskPluginWrapper>
        )
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [
            PLUGIN_META_KEY,
            (payload: AirdropJSONPayload) => {
                return PLUGIN_NAME
            },
        ],
    ]),
    CompositionDialogEntry: {
        label: `🪂 ${PLUGIN_NAME}`,
        dialog: CompositionDialog,
    },
}

export default sns
