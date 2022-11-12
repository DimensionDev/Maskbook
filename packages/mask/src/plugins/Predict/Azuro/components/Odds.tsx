import { makeStyles } from '@masknet/theme'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useCallback } from 'react'
import { PickContext } from '../context/usePickContext'
import { betTypeOdds } from '@azuro-protocol/sdk'
import { outcomeRegistry, outcomeSecondParam, truncateDecimals } from '../helpers'
import { Markets } from '../types'
import type { Outcome, Event } from '../types.js'

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
    event: Event
}

export function Odds(props: OddsProps) {
    const { classes } = useStyles()
    const {
        event,
        event: { conditions },
    } = props
    const { onOpenPlaceBetDialog, setConditionPick, setGamePick } = PickContext.useContainer()

    const handleOnClickOdd = useCallback((pick: Outcome) => {
        setConditionPick(pick)
        setGamePick(event)
        onOpenPlaceBetDialog()
    }, [])

    console.log('conditions: ', conditions)

    return (
        <>
            {conditions.map((condition, conditionIndex, participants) => {
                const { paramId } = betTypeOdds[condition.outcomes[0]]

                return (
                    <Grid key={condition.id} container alignItems="center" flexWrap="nowrap">
                        <Grid container flexWrap="nowrap" justifyContent="space-between" alignItems="center">
                            {event.marketRegistryId === Markets.TotalGoals ? (
                                <Typography>{outcomeSecondParam[paramId].value}</Typography>
                            ) : null}
                            {condition.outcomes.map((outcomeId, index) => {
                                const { outcomeRegistryId, marketRegistryId, paramId } = betTypeOdds[outcomeId]
                                const test = outcomeRegistry[outcomeRegistryId]
                                const title = test(event)
                                console.log('event: ', event)

                                const odds =
                                    event.marketRegistryId === Markets.DoubleChance
                                        ? condition.odds[index + 1]
                                        : condition.odds[index]
                                const pick: Outcome = {
                                    outcomesRegistryId: condition.outcomesRegistryId,
                                    conditionId: condition.id,
                                    outcomeId,
                                    outcomeRegistryId: condition.outcomesRegistryId[index],
                                    paramId,
                                    value: odds,
                                }

                                const key = `${event.gameId}-${condition.id}-${marketRegistryId}`

                                return (
                                    <Grid
                                        key={key}
                                        container
                                        flexWrap="nowrap"
                                        justifyContent="space-between"
                                        className={
                                            event.marketRegistryId === Markets.TotalGoals
                                                ? classes.OUchoice
                                                : classes.choice
                                        }
                                        onClick={() => handleOnClickOdd(pick)}>
                                        <Typography className={classes.outcome}>
                                            {event.marketRegistryId === Markets.TotalGoals
                                                ? title.slice(0, 1)
                                                : event.marketRegistryId === Markets.Handicap ||
                                                  event.marketRegistryId === Markets.TotalRounds
                                                ? `${title.slice(0, 1)} ${outcomeSecondParam[paramId].value}`
                                                : title}
                                        </Typography>
                                        <Typography className={classes.odds}>{truncateDecimals(odds)}</Typography>
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </Grid>
                )
            })}
        </>
    )
}
