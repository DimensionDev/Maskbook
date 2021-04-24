import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import VCentDialog from './UI/TweetDialog'

export const VCentPluginDefine: PluginConfig = {
    id: PLUGIN_IDENTIFIER,
    pluginName: 'VCent',
    pluginIcon: '🔓',
    identifier: PLUGIN_IDENTIFIER,
    pluginDescription: 'A Plugin for https://v.cent.co/',
    stage: PluginStage.Production,
    scope: PluginScope.Internal,

    postInspector: function Component(): JSX.Element | null {
        const tweetAddress = usePostInfoDetails('postID')
        if (!tweetAddress) return null
        if (window.location.pathname.split('/')[3] != tweetAddress) return null
        return <VCentDialog tweetAddress={tweetAddress} />
    },
}
