import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import TweetDialog from './UI/TweetDialog'

export const TweetPluginDefine: PluginConfig = {
    pluginName: 'Tweet',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Internal,

    postInspector: function Component(): JSX.Element | null {
        const tweet = usePostInfoDetails('postID')

        if (!tweet) return null

        return <TweetDialog tweet={tweet} />
    },
}
