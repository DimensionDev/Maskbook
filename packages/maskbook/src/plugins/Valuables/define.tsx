import { PluginConfig, PluginStage, PluginScope } from '../types'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { VCENT_PLUGIN_ID } from './constants'
import BidCard from './UI/BidCard'

export const ValuablesPluginDefine: PluginConfig = {
    pluginName: 'Valuables',
    identifier: VCENT_PLUGIN_ID,
    stage: PluginStage.Development,
    scope: PluginScope.Internal,

    postInspector: function Component(): JSX.Element | null {
        const id = usePostInfoDetails('postID')

        if (!id) return null

        return <BidCard id={id} />
    },
}
