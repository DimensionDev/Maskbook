import { Grid, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales'
import { VersusIcon } from '../icons/VersusIcon'

const useStyles = makeStyles()((theme) => ({
    container: { marginBottom: theme.spacing(2.1) },
    teamContainer: {
        width: 50,
        textAlign: 'center',
        flex: '1',
    },
    emblem: {
        height: 50,
    },
    name: {
        fontSize: 12,
        fontWeight: 500,
    },
    versusIcon: {
        fill: theme.palette.mode === 'light' ? theme.palette.common.black : theme.palette.common.white,
    },
}))

interface TeamsProps {
    participants: Array<{
        name: string
        image: string
    }>
}

export function Teams(props: TeamsProps) {
    const t = useI18N()
    const { participants } = props
    const { classes } = useStyles()

    return (
        <Grid className={classes.container} container justifyContent="space-around" wrap="nowrap" alignItems="baseline">
            <Grid className={classes.teamContainer}>
                <img
                    className={classes.emblem}
                    src={new URL(participants[0].image, import.meta.url).toString()}
                    alt={t.plugin_azuro_home_team()}
                />
                <Typography className={classes.name}>{participants[0].name}</Typography>
            </Grid>
            <Grid flex="1" textAlign="center">
                <VersusIcon className={classes.versusIcon} />
            </Grid>
            <Grid className={classes.teamContainer}>
                <img
                    className={classes.emblem}
                    src={new URL(participants[1].image, import.meta.url).toString()}
                    alt={t.plugin_azuro_away_team()}
                />
                <Typography className={classes.name}>{participants[1].name}</Typography>
            </Grid>
        </Grid>
    )
}
