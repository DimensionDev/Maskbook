import type { AzuroGame } from '@azuro-protocol/sdk'
import { makeStyles } from '@masknet/theme'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { outcomeRegistry, param } from '../helpers'
import type { Odds as Pick } from '../types'

const useStyles = makeStyles()((theme) => ({
    choice: {
        flexWrap: 'nowrap',
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
    OUchoice: {
        width: 75,
        flexWrap: 'nowrap',
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
    outcome: { fontWeight: 400, overflow: 'hidden' },
    odds: {
        fontSize: 16,
        fontWeight: 500,
    },
}))

type OddsProps = {
    game: AzuroGame
    setOpenPlaceBetDialog: () => void
    setPick: (pick: Pick | null) => void
    setGamePick: (game: AzuroGame | null) => void
}

export function Odds(props: OddsProps) {
    const { classes } = useStyles()
    const {
        game,
        setOpenPlaceBetDialog,
        setPick,
        setGamePick,
        game: { conditions },
    } = props
    const DEFAULT_PARAM_ID = 1

    const handleOnClickOdd = (pick: Pick, game: AzuroGame) => {
        setPick(pick)
        setGamePick(game)
        setOpenPlaceBetDialog()
    }

    if (Object.keys(conditions).length === 1) {
        const odds = conditions[0].odds

        return (
            <div>
                {odds.map((pick) => {
                    const key = `${pick.conditionId}-${pick.outcomeId}-${pick.outcomeRegistryId}`
                    const title = outcomeRegistry[pick.outcomeRegistryId](game)

                    return (
                        <Grid
                            key={key}
                            container
                            justifyContent="space-between"
                            className={classes.choice}
                            onClick={() => handleOnClickOdd(pick, game)}>
                            <Typography className={classes.outcome}>{title}</Typography>
                            <Typography className={classes.odds}>{pick.value.toFixed(2)}</Typography>
                        </Grid>
                    )
                })}
            </div>
        )
    }

    return (
        <>
            {conditions.map((condition, index) => (
                <Grid key={condition.paramId} container alignItems="center" flexWrap="nowrap">
                    <Grid container flexWrap="nowrap" justifyContent="space-between" alignItems="center">
                        <Typography>{param[condition.paramId]}</Typography>
                        {condition.odds.map(({ outcomeRegistryId, outcomeId, conditionId, value }) => {
                            const key = `${conditionId}-${outcomeId}-${outcomeRegistryId}`
                            const title = outcomeRegistry[outcomeRegistryId](game)

                            return (
                                <Grid
                                    key={key}
                                    container
                                    flexWrap="nowrap"
                                    justifyContent="space-between"
                                    className={classes.OUchoice}
                                    onClick={() => console.log('odd')}>
                                    <Typography className={classes.outcome}>{title.slice(0, 1)}</Typography>
                                    <Typography className={classes.odds}>{value.toFixed(2)}</Typography>
                                </Grid>
                            )
                        })}
                    </Grid>
                </Grid>
            ))}
        </>
    )
}
