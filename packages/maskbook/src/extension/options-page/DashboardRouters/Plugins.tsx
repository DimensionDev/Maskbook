import { makeStyles } from '@material-ui/core/styles'
import { useI18N } from '../../../utils'
import PluginCard from '../DashboardComponents/PluginCard'

import DashboardRouterContainer from './Container'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { usePluginI18NField } from '../../../plugin-infra/I18NFieldRender'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
    pluginList: {
        padding: theme.spacing(3, 0),
        margin: 0,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridGap: theme.spacing(3),
        [theme.breakpoints.down('sm')]: {
            display: 'block',
        },
    },
    pluginItem: {
        listStyle: 'none',
    },
}))

export default function DashboardSettingsRouter() {
    const { t } = useI18N()
    const classes = useStyles()
    const plugins = useActivatedPluginsSNSAdaptor()
    const field = usePluginI18NField()

    return (
        <DashboardRouterContainer title={t('plugins')}>
            <ul className={classes.pluginList}>
                {plugins.map((plugin) => (
                    <li className={classes.pluginItem} key={plugin.ID}>
                        <PluginCard
                            key={plugin.ID}
                            name={field(plugin.ID, plugin.name)}
                            id={plugin.ID}
                            icon={plugin.icon}
                            description={plugin.description ? field(plugin.ID, plugin.description) : ''}
                        />
                    </li>
                ))}
            </ul>
        </DashboardRouterContainer>
    )
}
