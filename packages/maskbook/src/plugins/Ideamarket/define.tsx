import { PluginConfig, PluginStage, PluginScope } from '../types'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import Fetcher from './Fetcher'

export const IdeamarketPluginDefine: PluginConfig = {
    pluginName: 'Ideamarket',
    identifier: 'ideamarket.io',
    stage: PluginStage.Development,
    scope: PluginScope.Internal,

    postInspector: function Component(): JSX.Element | null {
        const user = usePostInfoDetails('postBy').userId

        if (!user) return null

        const username = '@' + user.toLowerCase()

        return <Fetcher username={username} />
    },
}
