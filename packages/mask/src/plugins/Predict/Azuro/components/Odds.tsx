import type { AzuroGame } from '@azuro-protocol/sdk'
import { makeStyles } from '@masknet/theme'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useCallback } from 'react'
import { PickContext } from '../context/usePickContext'
import { outcomeRegistry, outcomeSecondParam } from '../helpers'
import type { Odds as Pick } from '../types'
import { v4 } from 'uuid'

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
}

export function Odds(props: OddsProps) {
    const { classes } = useStyles()
    const {
        game,
        game: { conditions },
    } = props
    const { onOpenPlaceBetDialog, setConditionPick, setGamePick } = PickContext.useContainer()

    const handleOnClickOdd = useCallback((pick: Pick) => {
        setConditionPick(pick)
        setGamePick(game)
        onOpenPlaceBetDialog()
    }, [])

    if (Object.keys(conditions).length === 1) {
        const odds = conditions[0].odds

        return (
            <div>
                {odds.map((pick) => {
                    const title = outcomeRegistry[pick.outcomeRegistryId](game)

                    return (
                        <Grid
                            key={v4()}
                            container
                            justifyContent="space-between"
                            className={classes.choice}
                            onClick={() => handleOnClickOdd(pick as Pick)}>
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
            {conditions.map((condition) => (
                <Grid key={v4()} container alignItems="center" flexWrap="nowrap">
                    <Grid container flexWrap="nowrap" justifyContent="space-between" alignItems="center">
                        <Typography>{outcomeSecondParam[condition.paramId]}</Typography>
                        {condition.odds.map((pick) => {
                            const title = outcomeRegistry[pick.outcomeRegistryId](game)

                            return (
                                <Grid
                                    key={v4()}
                                    container
                                    flexWrap="nowrap"
                                    justifyContent="space-between"
                                    className={classes.OUchoice}
                                    onClick={() => handleOnClickOdd(pick as Pick)}>
                                    <Typography className={classes.outcome}>{title.slice(0, 1)}</Typography>
                                    <Typography className={classes.odds}>{pick.value.toFixed(2)}</Typography>
                                </Grid>
                            )
                        })}
                    </Grid>
                </Grid>
            ))}
        </>
    )
}
