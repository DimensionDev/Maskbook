import { Box, Card, Typography, Button } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { useEvent } from '../hooks/useEvent'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    title: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        '& > :last-child': {
            marginTop: 4,
            marginLeft: 4,
        },
    },
}))

interface EventProps {
    link: string
    slug: string
}

export function EventView(props: EventProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { value: event, error, loading, retry } = useEvent(props.slug)
    console.log(event, error, loading)
    if (loading) return <Typography color="textPrimary">Loading...</Typography>
    if (error)
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary">Something went wrong.</Typography>
                <Button sx={{ marginTop: 1 }} size="small" onClick={retry}>
                    Retry
                </Button>
            </Box>
        )
    if (!event) return null

    return (
        <Card variant="outlined" className={classes.root} elevation={0}>
            <div className={classes.title}>
                <Typography variant="h6" color="textPrimary">
                    {event.name}
                </Typography>
            </div>
        </Card>
    )
}
