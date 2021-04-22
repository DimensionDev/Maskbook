import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import VCentDialog from './UI/TweetDialog'

export const VCentPluginDefine: PluginConfig = {
    pluginName: 'VCent',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Internal,

    postInspector: function Component(): JSX.Element | null {
        const tweetAddress = usePostInfoDetails('postID')
        if (!tweetAddress) return null
        if (window.location.href.includes('v.cent.co')) return null
        return <VCentDialog tweetAddress={tweetAddress} />
    },
}
