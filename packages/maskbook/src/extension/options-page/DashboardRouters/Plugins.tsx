import { useState } from 'react'
import { TextField, IconButton } from '@material-ui/core'
import { makeStyles, createStyles, ThemeProvider } from '@material-ui/core/styles'
import SearchIcon from '@material-ui/icons/Search'
import ClearIcon from '@material-ui/icons/Clear'
import PluginCard from '../DashboardComponents/PluginCard'

import DashboardRouterContainer from './Container'
import { useI18N } from '../../../utils/i18n-next-ui'
import { extendsTheme } from '../../../utils/theme'
import { PluginUI } from '../../../plugins/PluginUI'
import { PluginScope } from '../../../plugins/types'

const useStyles = makeStyles((theme) =>
    createStyles({
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
    }),
)

const pluginsTheme = extendsTheme((theme) => ({}))

export default function DashboardSettingsRouter() {
    const { t } = useI18N()
    const classes = useStyles()
    const [search, setSearch] = useState('')
    const [searchUI, setSearchUI] = useState('')

    return (
        <DashboardRouterContainer title={t('plugins')}>
            <ThemeProvider theme={pluginsTheme}>
                <ul className={classes.pluginList}>
                    {[...PluginUI.values()]
                        .filter((x) => x.scope === PluginScope.Public)
                        .map((y) => (
                            <li className={classes.pluginItem}>
                                <PluginCard key={y.ID} plugin={y} />
                            </li>
                        ))}
                </ul>
            </ThemeProvider>
        </DashboardRouterContainer>
    )
}
