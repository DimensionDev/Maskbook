import { Button, makeStyles, Typography } from '@material-ui/core'
import { useState } from 'react'
import { useI18N } from '../../../utils'
import { useJoinGame, useMakeDeposit, useWithdraw } from '../hooks/useGameActions'
import type { GoodGhostingInfo } from '../types'

const useStyles = makeStyles((theme) => ({
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    },
}))

interface GameActionProps {
    info: GoodGhostingInfo
}

export function GameAction(props: GameActionProps) {
    const classes = useStyles()
    const { t } = useI18N()

    const { canJoinGame, joinGame } = useJoinGame(props.info)
    const { canMakeDeposit, makeDeposit } = useMakeDeposit(props.info)
    const { canWithdraw, withdraw } = useWithdraw(props.info)

    const [buttonEnabled, setButtonEnabled] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const buttonAction = async (action: () => Promise<void>) => {
        setButtonEnabled(false)
        await action().catch(() => setErrorMessage(t('error_unknown')))
        setButtonEnabled(true)
        props.info.refresh()
    }

    const getButton = () => {
        if (canJoinGame) {
            return {
                action: joinGame,
                text: t('plugin_good_ghosting_join_game'),
            }
        } else if (canMakeDeposit) {
            return {
                action: makeDeposit,
                text: t('plugin_good_ghosting_make_deposit'),
            }
        } else if (canWithdraw) {
            return {
                action: withdraw,
                text: t('plugin_good_ghosting_withdraw'),
            }
        } else return {}
    }
    const buttonMethod = getButton()

    return (
        <>
            {buttonMethod.action && (
                <Button
                    color="primary"
                    variant="outlined"
                    disabled={!buttonEnabled}
                    className={classes.button}
                    onClick={() => buttonAction(buttonMethod.action)}>
                    {buttonMethod.text}
                </Button>
            )}
            <Typography variant="body1" color="warning">
                {errorMessage}
            </Typography>
        </>
    )
}
