import { useChainId } from '@masknet/web3-shared-evm'
import { Avatar, Button, Grid, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { IdeaToken } from '../types'
import { IdeaMarketIcon } from '../icons/IdeaMarketIcon'
import { useEffect } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginTraderMessages } from '../../Trader/messages'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    title: {
        padding: theme.spacing(1, 0),
        display: 'flex',
        alignItems: 'center',
    },
    meta: {
        fontSize: 14,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        display: 'flex',
        alignItems: 'left',
    },
    avatar: {
        width: theme.spacing(8),
        height: theme.spacing(8),
        backgroundColor: 'inherit',
        border: `solid 1px ${theme.palette.divider}`,
    },
    text: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        '-webkit-line-clamp': '4',
        '-webkit-box-orient': 'vertical',
    },
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
        fontWeight: 500,
    },
    chip: {
        width: '100%',
        fontSize: 'x-small',
    },
    ImIcon: {
        width: theme.spacing(5),
    },
}))

interface IdeaTokenViewDeckProps {
    ideaToken: IdeaToken
}

export function IdeaTokenViewDeck(props: IdeaTokenViewDeckProps) {
    const { ideaToken } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    const chainId = useChainId()
    const rank = `Rank ${ideaToken.rank}`.toUpperCase()

    const { setDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)

    // #region manager share
    // const managerShare = new BigNumber(pool.balanceOfManager)
    //     .dividedBy(pool.totalSupply)
    //     .multipliedBy(100)
    //     .integerValue(BigNumber.ROUND_UP)
    // #endregion

    // #region the invest dialog
    // const { setDialog: openInvestDialog } = useRemoteControlledDialog(PluginDHedgeMessages.InvestDialogUpdated)
    // const onInvest = useCallback(() => {
    //     if (!pool || !inputTokens) return
    //     openInvestDialog({
    //         open: true,
    //         pool: pool,
    //         tokens: inputTokens,
    //     })
    // }, [pool, inputTokens, openInvestDialog])
    // #endregion

    function openSwapDialog() {
        setDialog({ open: true })
    }

    useEffect(() => {
        setDialog({ open: true })
    }, [])

    return (
        <Grid container className={classes.meta} direction="row">
            <Grid item alignSelf="center" xs={2}>
                <Link target="_blank" rel="noopener noreferrer" href="">
                    <Avatar className={classes.avatar}>
                        <IdeaMarketIcon className={classes.ImIcon} />
                    </Avatar>
                </Link>
            </Grid>
            <Grid item xs={6}>
                <div className={classes.title}>
                    <Link color="primary" target="_blank" rel="noopener noreferrer" href="">
                        <Typography variant="h6">{ideaToken.name}</Typography>
                    </Link>
                </div>
                <Grid container className={classes.meta} direction="column" spacing={0.5}>
                    <Grid item>
                        <Typography variant="body2" color="textPrimary" className={classes.text}>
                            {/* <Trans
                                i18nKey="plugin_dhedge_managed_by"
                                components={{
                                    manager: (
                                        <Link
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={resolveAddressLinkOnExplorer(chainId, pool.managerAddress)}
                                        />
                                    ),
                                }}
                                values={{
                                    managerName: pool.managerName,
                                }}
                            /> */}
                            {ideaToken.market.name}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body2" color="textSecondary" className={classes.text}>
                            {rank}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item alignSelf="right" xs={4} textAlign="center">
                <Button
                    className={classes.button}
                    variant="contained"
                    fullWidth
                    color="primary"
                    onClick={openSwapDialog}>
                    Buy some
                </Button>
            </Grid>
        </Grid>
    )
}
