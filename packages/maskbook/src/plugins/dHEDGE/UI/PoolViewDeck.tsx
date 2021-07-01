import { FungibleTokenDetailed, resolveAddressLinkOnExplorer, useChainId } from '@masknet/web3-shared'
import { Avatar, Button, Chip, Grid, Link, makeStyles, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import { Trans } from 'react-i18next'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useI18N } from '../../../utils/i18n-next-ui'
import { PluginTraderMessages } from '../../Trader/messages'
import type { Coin } from '../../Trader/types'
import { useAvatar } from '../hooks/useManager'
import { usePoolURL } from '../hooks/useUrl'
import { PluginDHedgeMessages } from '../messages'
import type { Pool } from '../types'

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    title: {
        padding: theme.spacing(1, 0),
        display: 'flex',
        alignItems: 'center',
        '& > :last-child': {
            marginTop: 4,
            marginLeft: 4,
        },
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
}))

interface PoolDeckProps {
    pool: Pool
    inputToken: FungibleTokenDetailed
}

export function PoolViewDeck(props: PoolDeckProps) {
    const { pool, inputToken } = props

    const classes = useStyles()
    const { t } = useI18N()

    const blockie = useAvatar(pool.managerAddress)
    const chainId = useChainId()
    const poolUrl = usePoolURL(pool.address)

    //#region manager share
    const managerShare = new BigNumber(pool.balanceOfManager)
        .dividedBy(pool.totalSupply)
        .multipliedBy(100)
        .integerValue(BigNumber.ROUND_UP)

    //#endregion

    //#region Swap
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginTraderMessages.events.swapDialogUpdated)
    const openSwap = useCallback(() => {
        openSwapDialog({
            open: true,
            traderProps: {
                coin: {
                    id: inputToken.address,
                    name: inputToken.name ?? '',
                    symbol: inputToken.symbol ?? '',
                    contract_address: inputToken.address,
                    decimals: inputToken.decimals,
                } as Coin,
            },
        })
    }, [openSwapDialog])
    //#endregion

    //#region the invest dialog
    const { setDialog: openInvestDialog } = useRemoteControlledDialog(PluginDHedgeMessages.events.InvestDialogUpdated)
    const onInvest = useCallback(() => {
        if (!pool) return
        openInvestDialog({
            open: true,
            pool: pool,
            token: inputToken,
        })
    }, [pool, openInvestDialog])
    //#endregion

    return (
        <Grid container className={classes.meta} direction="row">
            <Grid item alignSelf="center" xs={2}>
                <Link target="_blank" rel="noopener noreferrer" href={poolUrl}>
                    <Avatar src={blockie} className={classes.avatar} />
                </Link>
            </Grid>
            <Grid item xs={8}>
                <div className={classes.title}>
                    <Link color="primary" target="_blank" rel="noopener noreferrer" href={poolUrl}>
                        <Typography variant="h6">{pool.name.toUpperCase()}</Typography>
                    </Link>
                </div>
                <Grid container className={classes.meta} direction="column" spacing={0.5}>
                    <Grid item>
                        <Typography variant="body2" color="textPrimary" className={classes.text}>
                            <Trans
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
                            />
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body2" color="textSecondary" className={classes.text}>
                            <Trans
                                i18nKey="plugin_dhedge_manager_share"
                                components={{
                                    share: <span />,
                                }}
                                values={{
                                    managerShare: managerShare,
                                }}
                            />
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item alignSelf="right" xs={2}>
                <Button className={classes.button} variant="contained" fullWidth color="primary" onClick={onInvest}>
                    {t('plugin_dhedge_invest')}
                </Button>
                <Chip
                    className={classes.chip}
                    label={t('plugin_dhedge_buy_token', { symbol: inputToken.symbol })}
                    clickable
                    color="primary"
                    variant="outlined"
                    onClick={openSwap}
                />
            </Grid>
        </Grid>
    )
}
