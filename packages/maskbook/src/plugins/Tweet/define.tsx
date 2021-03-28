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
        const tweetAddress = usePostInfoDetails('postID')
        console.log('TWEEEETT ', tweetAddress)
        if (!tweetAddress) return null
        return <TweetDialog tweetAddress={tweetAddress} />
    },
}
















