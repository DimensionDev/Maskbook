import { PluginConfig, PluginStage, PluginScope } from '../types'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import Fetcher from './Fetcher'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles(() => ({
    layout: {
        position: 'absolute',
        right: '20px',
        top: 0,
        marginTop: '-37px',
    },
}))

export const IdeamarketPluginDefine: PluginConfig = {
    id: 'ideamarket.io',
    pluginName: 'Ideamarket',
    identifier: 'ideamarket.io',
    stage: PluginStage.Development,
    scope: PluginScope.Internal,
    pluginDescription: '',
    pluginIcon: '',

    postInspector: function Component(): JSX.Element | null {
        const user = usePostInfoDetails('postBy').userId
        const classes = useStyles()

        if (!user) return null

        const username = '@' + user.toLowerCase()

        return (
            <div className={classes.layout}>
                <Fetcher username={username} />
            </div>
        )
    },
}
