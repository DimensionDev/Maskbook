import type { AzuroGame } from '@azuro-protocol/sdk'
import { Event } from './Event'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { useCallback, useState } from 'react'
import { PlaceBetDialog } from '../PlaceBetDialog'
import type { Odds } from '../types'
import { useControlledDialog } from '../../../../utils'
import { Placeholder } from './Placeholder'
import { Loader } from './Loader'

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
    const { t } = useI18N()
    const { classes } = useStyles()
    const [conditionPick, setConditionPick] = useState<Odds | null>(null)
    const [gamePick, setGamePick] = useState<AzuroGame | null>(null)
    const {
        open: openPlaceBetDialog,
        onClose: onClosePlaceBetDialog,
        onOpen: onOpenPlaceBetDialog,
    } = useControlledDialog()

    const onCloseDialog = () => {
        setConditionPick(null)
        setGamePick(null)
        onClosePlaceBetDialog()
    }

    const setOpenPlaceBetDialog = useCallback(() => onOpenPlaceBetDialog, [onOpenPlaceBetDialog])
    const setPick = useCallback(() => setConditionPick, [setConditionPick])
    const setGame = useCallback(() => setGamePick, [setGamePick])
    console.log('gamePick: ', gamePick)
    console.log('conditionPick: ', conditionPick)
    console.log('openPlaceBetDialog: ', openPlaceBetDialog)

    if (loading) {
        return <Loader />
    }

    return (
        <div className={classes.container}>
            {games && games?.length > 0 ? (
                games?.map((game: AzuroGame) => (
                    <Event
                        key={`${game.id}-${game.marketRegistryId}`}
                        game={game}
                        setOpenPlaceBetDialog={onOpenPlaceBetDialog}
                        setConditionPick={setConditionPick}
                        setGamePick={setGamePick}
                    />
                ))
            ) : (
                <Placeholder retry={retry} />
            )}
            {conditionPick && gamePick ? (
                <PlaceBetDialog open game={gamePick} condition={conditionPick} onClose={onCloseDialog} />
            ) : null}
        </div>
    )
}
