import { useState } from 'react'
import { TextField, IconButton, Typography } from '@material-ui/core'
import { makeStyles, createStyles, ThemeProvider } from '@material-ui/core/styles'
import SearchIcon from '@material-ui/icons/Search'
import ClearIcon from '@material-ui/icons/Clear'
import DashboardRouterContainer from './Container'
import { useI18N } from '../../../utils/i18n-next-ui'
import { extendsTheme } from '../../../utils/theme'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
    }),
)

const pluginsTheme = extendsTheme((theme) => ({}))

export default function DashboardSettingsRouter() {
    const { t } = useI18N()
    const [search, setSearch] = useState('')
    const [searchUI, setSearchUI] = useState('')

    const actions = [
        <TextField
            placeholder={t('search')}
            size="small"
            value={searchUI}
            onChange={(e) => {
                setSearchUI(e.target.value)
                setSearch(e.target.value)
            }}
            InputProps={{
                endAdornment: (
                    <IconButton size="small" onClick={() => setSearch('')}>
                        {search ? <ClearIcon /> : <SearchIcon />}
                    </IconButton>
                ),
            }}
        />,
    ]

    return (
        <DashboardRouterContainer
            title={t('plugins')}
            actions={actions}
            floatingButtons={[
                {
                    icon: <SearchIcon />,
                    handler: () => {},
                },
            ]}>
            <ThemeProvider theme={pluginsTheme}>
                <div className="wrapper"></div>
            </ThemeProvider>
        </DashboardRouterContainer>
    )
}
