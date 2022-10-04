import { Event } from './Event'
import { makeStyles } from '@masknet/theme'
import { PlaceBetDialog } from '../PlaceBetDialog'
import { PickContext } from '../context/usePickContext'
import { Placeholder } from '../components/Placeholder'
import { Loader } from '../components/Loader'
import { useI18N as useBaseI18N } from '../../../../utils'
import type { Event as EventType } from '../types.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontFamily: 'Muli,Helvetica,-apple-system,system-ui,"sans-serif"',
        width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
    },
    container: {
        height: 295,
        overflowY: 'scroll',
        '& > div': {
            marginBottom: theme.spacing(1.5),
        },
        '& > div:last-child': {
            marginBottom: theme.spacing(0),
        },
    },
    filters: { marginBottom: theme.spacing(1.5) },
}))

export function Events(props: { events: EventType[] | undefined; retry: () => void; loading: boolean }) {
    const { events, retry, loading } = props
    const { classes } = useStyles()
    const { t } = useBaseI18N()

    if (loading) {
        return <Loader />
    }

    return (
        <div className={classes.container}>
            <PickContext.Provider>
                {events && events.length > 0 ? (
                    events.map((event: any) => (
                        <Event key={`${event.gameId}-${event.marketRegistryId}`} event={event} />
                    ))
                ) : (
                    <Placeholder />
                )}
                <PlaceBetDialog />
            </PickContext.Provider>
        </div>
    )
}
