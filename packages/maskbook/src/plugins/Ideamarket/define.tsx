import { PluginConfig, PluginStage, PluginScope } from '../types'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import LogoButton from './UI/LogoButton'

export const IdeamarketPluginDefine: PluginConfig = {
    pluginName: 'Ideamarket',
    identifier: 'ideamarket.io',
    stage: PluginStage.Development,
    scope: PluginScope.Internal,

    postInspector: function Component(): JSX.Element | null {
        const user = usePostInfoDetails('postBy').toText()
        // usere in format: "username:  person:twitter.com/elonmusk"

        if (!user) return null

        const pattern = /\/(\S+)/ // match everything after a slash

        let username = user.match(pattern)![1]

        username = '@' + username

        return <LogoButton username={username} />
    },
}
