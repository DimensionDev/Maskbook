import { Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    competition: {
        marginBottom: theme.spacing(2.1),
        fontWeight: 300,
        textOverflow: 'ellipsis',
        maxWidth: 190,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textAlign: 'center',
    },
}))

interface LeagueProps {
    name: string
}

export function League(props: LeagueProps) {
    const { name } = props
    const { classes } = useStyles()

    return (
        <Typography title={name} className={classes.competition}>
            {name}
        </Typography>
    )
}
