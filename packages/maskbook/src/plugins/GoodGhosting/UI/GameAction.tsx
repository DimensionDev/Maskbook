import {
    formatBalance,
    resolveTransactionLinkOnExplorer,
    TransactionStateType,
    useChainId,
    useERC20TokenDetailed,
} from '@masknet/web3-shared'
import { Button, Typography, Link } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useState } from 'react'
import { useI18N } from '../../../utils'
import { useJoinGame, useMakeDeposit, useWithdraw } from '../hooks/useGameActions'
import type { GoodGhostingInfo } from '../types'
import { DAI } from '../constants'
import { GameActionDialog } from './GameActionDialog'
import { useGameToken } from '../hooks/usePoolData'
import { isGameActionError } from '../utils'

const useStyles = makeStyles()((theme) => ({
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    },
}))

interface GameActionProps {
    info: GoodGhostingInfo
}

export function GameAction(props: GameActionProps) {
    const chainId = useChainId()
    const gameToken = useGameToken()

    const { classes } = useStyles()
    const { t } = useI18N()

    const { canJoinGame, joinGame } = useJoinGame(props.info)
    const { canMakeDeposit, makeDeposit } = useMakeDeposit(props.info)
    const { canWithdraw, withdraw } = useWithdraw(props.info)

    const [openDialog, setOpenDialog] = useState(false)
    const [buttonEnabled, setButtonEnabled] = useState(true)
    const [errorState, setErrorState] = useState<{ message?: string; link?: string }>({})
    const {
        value: tokenDetailed,
        loading: loadingToken,
        error: errorToken,
    } = useERC20TokenDetailed(DAI[chainId]?.address)

    if (loadingToken || errorToken) return <></>

    const buttonAction = async (action: () => Promise<void>) => {
        setButtonEnabled(false)
        setOpenDialog(false)
        setErrorState({})
        try {
            await action()
            props.info.refresh()
        } catch (error) {
            if (isGameActionError(error) && error.transactionHash) {
                const link = resolveTransactionLinkOnExplorer(chainId, error.transactionHash)
                if (error.gameActionStatus === TransactionStateType.CONFIRMED) {
                    setErrorState({
                        message: t('plugin_good_ghosting_tx_fail'),
                        link,
                    })
                } else {
                    setErrorState({
                        message: t('plugin_good_ghosting_tx_timeout'),
                        link,
                    })
                }
            } else {
                setErrorState({
                    message: t('plugin_good_ghosting_something_went_wrong'),
                })
            }
        } finally {
            setButtonEnabled(true)
        }
    }

    const getButton = () => {
        if (canJoinGame) {
            return {
                needsApprove: true,
                action: joinGame,
                text: t('plugin_good_ghosting_join_game'),
                helpText: t('plugin_good_ghosting_join_help_text', {
                    amount: formatBalance(props.info.segmentPayment, gameToken.decimals),
                    token: gameToken.symbol,
                }),
            }
        } else if (canMakeDeposit) {
            return {
                needsApprove: true,
                action: makeDeposit,
                text: t('plugin_good_ghosting_make_deposit'),
                helpText: t('plugin_good_ghosting_deposit_help_text', {
                    segmentPayment: formatBalance(props.info.segmentPayment, gameToken.decimals),
                    token: gameToken.symbol,
                }),
            }
        } else if (canWithdraw) {
            return {
                needsApprove: false,
                action: withdraw,
                text: t('plugin_good_ghosting_withdraw'),
                helpText: t('plugin_good_ghosting_withdraw_help_text'),
            }
        } else return {}
    }
    const buttonMethod = getButton()

    if (buttonMethod.action) {
        return (
            <>
                <GameActionDialog
                    open={openDialog}
                    actionText={buttonMethod.text}
                    titleText={buttonMethod.text}
                    bodyText={buttonMethod.helpText}
                    onAction={() => buttonAction(buttonMethod.action)}
                    onClose={() => setOpenDialog(false)}
                    info={props.info}
                    token={tokenDetailed}
                    needsApprove={buttonMethod.needsApprove}
                />
                <Button
                    color="primary"
                    variant="outlined"
                    disabled={!buttonEnabled}
                    className={classes.button}
                    onClick={() => setOpenDialog(true)}>
                    {buttonMethod.text}
                </Button>
                <Typography variant="body1" color="textPrimary">
                    {errorState.message}
                </Typography>
                {errorState.link && (
                    <Link color="primary" target="_blank" rel="noopener noreferrer" href={errorState.link}>
                        <Typography variant="subtitle1">{t('plugin_good_ghosting_view_on_explorer')}</Typography>
                    </Link>
                )}
            </>
        )
    } else return <></>
}
