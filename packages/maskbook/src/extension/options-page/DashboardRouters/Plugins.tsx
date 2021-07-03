import { useState } from 'react'
import { makeStyles, ThemeProvider } from '@material-ui/core/styles'
import { useI18N, extendsTheme } from '../../../utils'
import PluginCard from '../DashboardComponents/PluginCard'

import DashboardRouterContainer from './Container'
import { PluginUI } from '../../../plugins/PluginUI'
import { PluginScope } from '../../../plugins/types'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'

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

const pluginsTheme = extendsTheme((theme) => ({}))

export default function DashboardSettingsRouter() {
    const { t } = useI18N()
    const classes = useStyles()
    const [search, setSearch] = useState('')
    const [searchUI, setSearchUI] = useState('')
    const plugins = useActivatedPluginsSNSAdaptor()

    return (
        <DashboardRouterContainer title={t('plugins')}>
            <ThemeProvider theme={pluginsTheme}>
                <ul className={classes.pluginList}>
                    {[...PluginUI.values()]
                        .filter((plugin) => plugin.scope === PluginScope.Public)
                        .map((plugin) => (
                            <li className={classes.pluginItem} key={plugin.id}>
                                <PluginCard
                                    key={plugin.id}
                                    name={plugin.pluginName}
                                    icon={plugin.pluginIcon}
                                    id={plugin.id}
                                    description={plugin.pluginDescription}
                                />
                            </li>
                        ))}
                    {plugins.map((plugin) => (
                        <li className={classes.pluginItem} key={plugin.ID}>
                            <PluginCard
                                key={plugin.ID}
                                name={plugin.name.fallback}
                                id={plugin.ID}
                                icon={plugin.icon}
                                description={plugin.description?.fallback}
                            />
                        </li>
                    ))}
                </ul>
            </ThemeProvider>
        </DashboardRouterContainer>
    )
}
