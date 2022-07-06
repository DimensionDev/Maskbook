import {
    Button,
    FormControl,
    Grid,
    InputLabel,
    ListSubheader,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from '@mui/material'
import { useState } from 'react'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { useFetchGames, useLeagueList, useMarketList } from '../hooks'
import { Events } from '../components/Events'
import { Sport } from '../types'
import { DEFAULT_LABEL } from '../../constants'
import { useI18N } from '../../locales'
import { useI18N as useBaseI18N } from '../../../../utils'
import { RefreshIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontFamily: 'Muli,Helvetica,-apple-system,system-ui,"sans-serif"',
        width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
    },
    container: {
        position: 'relative',
    },
    contentEmpty: {
        height: 350,
        padding: theme.spacing(2),
    },
    filters: { marginBottom: theme.spacing(1.5) },
    input: {
        flex: 1,
        padding: theme.spacing(0.5),
    },
    selectShrinkLabel: {
        top: 6,
        backgroundColor: theme.palette.background.paper,
        paddingLeft: 2,
        paddingRight: 7,
        transform: 'translate(17px, -10px) scale(0.75) !important',
    },
    menuPaper: {
        maxHeight: 200,
    },
    searchField: {
        width: 150,
    },
    field: {
        width: 100,
    },
    refreshButton: {
        borderRadius: '15px',
        border: `solid 1px ${theme.palette.divider}`,
    },
}))

export function EventsView(): JSX.Element {
    const { t: tr } = useBaseI18N()
    const t = useI18N()
    const { classes } = useStyles()
    const [searchTerm, setSearchTerm] = useState<string>('')

    const [market, setMarket] = useState<number>(0)
    const [league, setLeague] = useState<string>(DEFAULT_LABEL)
    const [sort, setSort] = useState<string>(DEFAULT_LABEL)

    const { value, error, loading, retry } = useFetchGames(searchTerm, market, league, sort)
    const markets = useMarketList(value?.games)
    const leagues = useLeagueList(value?.games)
    const sorts = [DEFAULT_LABEL, 'Start Date', 'Newest']

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value
        setSearchTerm(term)
    }

    const marketSelect = usePortalShadowRoot((container) => (
        <Select
            MenuProps={{
                container,
                anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                classes: { paper: classes.menuPaper },
            }}
            value={market.toString()}
            label={t.plugin_market()}
            onChange={(event: SelectChangeEvent) => setMarket(Number(event.target.value))}>
            {markets?.map((market) => (
                <MenuItem key={market.id} value={market.id}>
                    {market.label}
                </MenuItem>
            ))}
        </Select>
    ))

    const leagueSelect = usePortalShadowRoot((container) => (
        <Select
            MenuProps={{
                container,
                anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                classes: { paper: classes.menuPaper },
            }}
            value={league}
            label={t.plugin_league()}
            onChange={(event: SelectChangeEvent) => setLeague(event.target.value)}>
            <MenuItem key={DEFAULT_LABEL} value={DEFAULT_LABEL}>
                {DEFAULT_LABEL}
            </MenuItem>

            <ListSubheader>{Sport.Dota2}</ListSubheader>
            {leagues
                ?.filter((league) => league.id.includes(Sport.Dota2))
                .map((league) => (
                    <MenuItem key={league.id} value={league.id}>
                        {league.label}
                    </MenuItem>
                ))}
            <ListSubheader>{Sport.Football}</ListSubheader>
            {leagues
                ?.filter((league) => !league.id.includes(Sport.Dota2))
                .map((league) => (
                    <MenuItem key={league.id} value={league.id}>
                        {league.label}
                    </MenuItem>
                ))}
        </Select>
    ))

    const sortSelect = usePortalShadowRoot((container) => (
        <Select
            MenuProps={{
                container,
                anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                classes: { paper: classes.menuPaper },
            }}
            value={sort}
            label={t.plugin_sort()}
            onChange={(event: SelectChangeEvent) => setSort(event.target.value)}>
            {sorts?.map((sort) => (
                <MenuItem key={sort} value={sort}>
                    {sort}
                </MenuItem>
            ))}
        </Select>
    ))

    return (
        <div className={classes.container}>
            <Grid container direction="row" justifyContent="space-between" wrap="nowrap" className={classes.filters}>
                <TextField
                    className={classes.searchField}
                    size="small"
                    placeholder={t.plugin_search_events()}
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <FormControl className={classes.field} size="small">
                    <InputLabel id="market">{t.plugin_market()}</InputLabel>
                    {marketSelect}
                </FormControl>
                <FormControl className={classes.field} size="small">
                    <InputLabel id="league">{t.plugin_league()}</InputLabel>
                    {leagueSelect}
                </FormControl>
                <FormControl className={classes.field} size="small">
                    <InputLabel id="sort">{t.plugin_sort()}</InputLabel>
                    {sortSelect}
                </FormControl>
                <Button
                    className={classes.refreshButton}
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={() => retry()}>
                    <RefreshIcon />
                </Button>
            </Grid>
            <div>
                <Events games={value?.gamesFiltered} retry={retry} loading={loading} />
            </div>
        </div>
    )
}
