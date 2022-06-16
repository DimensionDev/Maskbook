import { Grid, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(1),
        border: '1px solid var(--mask-twitter-border-line)',
        borderRadius: 8,
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.common.black,
        '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.background.default,
            cursor: 'pointer',
        },
    },
    title: { fontWeight: 300, overflow: 'hidden' },
    odd: {
        fontSize: 16,
        fontWeight: 500,
    },
}))

interface ChoiceProps {
    title: string
    odd: number
}

export function Odd(props: ChoiceProps) {
    const { classes } = useStyles()
    const { title, odd } = props

    return (
        <Grid container justifyContent="space-between" className={classes.container}>
            <Typography className={classes.title}>{title}</Typography>
            <Typography className={classes.odd}>{odd.toFixed(2)}</Typography>
        </Grid>
    )
}
