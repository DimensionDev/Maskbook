import type { AzuroGame } from '@azuro-protocol/sdk'
import { Event } from './Event'
import { makeStyles } from '@masknet/theme'
import { PlaceBetDialog } from '../PlaceBetDialog'
import { Placeholder } from './Placeholder'
import { Loader } from './Loader'
import { PickContext } from '../context/usePickContext'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontFamily: 'Muli,Helvetica,-apple-system,system-ui,"sans-serif"',
        width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
    },
    contentEmpty: {
        padding: theme.spacing(2),
    },
    container: {
        height: 295,
        overflowY: 'scroll',
        '& > div': {
            marginBottom: theme.spacing(1.5),
        },
    },
    filters: { marginBottom: theme.spacing(1.5) },
}))

export function Events(props: { games: AzuroGame[] | undefined; retry: () => void; loading: boolean }) {
    const { games, retry, loading } = props
    const { classes } = useStyles()

    if (loading) {
        return <Loader />
    }

    return (
        <div className={classes.container}>
            <PickContext.Provider>
                {games && games.length > 0 ? (
                    games.map((game: AzuroGame) => <Event key={`${game.id}-${game.marketRegistryId}`} game={game} />)
                ) : (
                    <Placeholder retry={retry} />
                )}
                <PlaceBetDialog />
            </PickContext.Provider>
        </div>
    )
}
