import { makeStyles } from '@material-ui/core/styles'
import { useI18N, useValueRef } from '../../../utils'
import PluginCard, { PluginCardProps } from '../DashboardComponents/PluginCard'

import DashboardRouterContainer from './Container'
import { useRegisteredPlugins } from '@masknet/plugin-infra'
import { currentPluginEnabledStatus } from '../../../settings/settings'

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
    const plugins = useRegisteredPlugins()

    return (
        <DashboardRouterContainer title={t('plugins')}>
            <ul className={classes.pluginList}>
                {plugins
                    .filter((x) => !x.management?.internal)
                    .map((plugin) => (
                        <li className={classes.pluginItem} key={plugin.ID}>
                            <PluginCardContainer
                                key={plugin.ID}
                                name={plugin.name.fallback}
                                id={plugin.ID}
                                icon={plugin.icon}
                                description={plugin.description?.fallback}
                                canDisable={!plugin.management?.alwaysOn}
                            />
                        </li>
                    ))}
            </ul>
        </DashboardRouterContainer>
    )
}

function PluginCardContainer(props: Omit<PluginCardProps, 'enabled' | 'onSwitch'>) {
    const ref = currentPluginEnabledStatus['plugin:' + props.id]
    const status = useValueRef(ref)
    return <PluginCard {...props} enabled={status} onSwitch={() => (ref.value = !status)} />
}
