import { Box, Card, CardHeader, CardContent, Typography, Button, Grid } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { useEventBySlug } from '../hooks/useEvent'
import { useState } from '.pnpm/@types+react@17.0.29/node_modules/@types/react'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    content: {
        width: '100%',
        height: 'var(--contentHeight)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 !important',
    },
}))

interface EventProps {
    link: string
    slug: string
}

interface EventDetailsProps {
    event: object
}

export function EventView(props: EventProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [depositDialogOpen, depositDialogOpen] = useState(false)

    const { value: event, error, loading, retry } = useEventBySlug(props.slug)
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
            <CardHeader
                title={event.name}
                titleTypographyProps={{ variant: 'h6', color: 'textPrimary' }}
                subheader={<EventDetails event={event} />}
            />
            <CardContent className={classes.content} />
        </Card>
    )
}

function EventDetails(props: EventDetailsProps) {
    const { event } = props

    return (
        <Grid container wrap="nowrap" justifyContent="space-between" alignItems="center">
            <Grid item container justifyContent="space-between" alignItems="center" flex="1" wrap="nowrap">
                <Grid item container direction="column">
                    <Grid item>pot size</Grid>
                    <Grid item>12545</Grid>
                </Grid>
                <Grid item container direction="column">
                    <Grid item>average rentals</Grid>
                    <Grid item>12545</Grid>
                </Grid>
                <Grid item container direction="column">
                    <Grid item>closes in</Grid>
                    <Grid item>12545</Grid>
                </Grid>
            </Grid>
            <Grid item sx={{ textAlign: 'right' }}>
                open/ended
            </Grid>

            <Button
                variant="contained"
                fullWidth
                color="primary"
                disabled={!!validationMessage}
                onClick={isBuy ? () => setBuyDialogOpen(true) : () => setSellDialogOpen(true)}>
                {validationMessage ? validationMessage : isBuy ? t('buy') : t('sell')}
            </Button>
            <BuyDialog
                open={buyDialogOpen}
                market={market}
                outcome={selectedOutcome}
                token={cashToken}
                onClose={() => setBuyDialogOpen(false)}
            />
        </Grid>
    )
}
