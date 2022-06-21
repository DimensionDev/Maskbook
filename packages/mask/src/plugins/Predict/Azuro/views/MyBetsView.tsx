import { useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Grid, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useI18N } from '../../locales'
import { useFetchUserGames } from '../hooks'
import { UserFilter } from '../types'
import { Bets } from '../components/Bets'

const useStyles = makeStyles()((theme) => ({
    container: {
        marginBottom: theme.spacing(1),
    },
    content: {
        padding: theme.spacing(2),
    },
}))

export function MyBetsView() {
    const t = useI18N()
    const { classes } = useStyles()

    const [filter, setFilter] = useState<UserFilter>(UserFilter.All)
    const { value: bets, error, loading, retry } = useFetchUserGames(filter)

    const handleFilter = (event: React.MouseEvent<HTMLElement>, newFilter: UserFilter) => {
        setFilter(newFilter)
    }

    return (
        <>
            <Grid container justifyContent="center" className={classes.container}>
                <ToggleButtonGroup size="small" value={filter} exclusive onChange={handleFilter} aria-label="filter">
                    <ToggleButton value={UserFilter.All} aria-label="all">
                        {t.plugin_filter_all()}
                    </ToggleButton>
                    <ToggleButton value={UserFilter.Active} aria-label="active">
                        {t.plugin_filter_active()}
                    </ToggleButton>
                    <ToggleButton value={UserFilter.Ended} aria-label="ended">
                        {t.plugin_filter_ended()}
                    </ToggleButton>
                </ToggleButtonGroup>
            </Grid>

            <Bets bets={bets} loading={loading} error={error} retry={retry} />
        </>
    )
}
