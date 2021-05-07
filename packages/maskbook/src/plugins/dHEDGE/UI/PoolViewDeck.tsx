import {
    makeStyles,
    createStyles,
    Card,
    Typography,
    Grid,
    Link,
    Avatar,
    Button,
    Chip,
} from '@material-ui/core'
import type { Pool } from '../types'
import { resolveAddressLinkOnEtherscan } from '../../../web3/pipes'
import { useAvatar } from '../hooks/useManager'
import { Trans } from 'react-i18next'
import { useChainId } from '../../../web3/hooks/useBlockNumber'
import { usePoolURL } from '../hooks/useUrl'
import {
    useRemoteControlledDialog,
} from '../../../utils/hooks/useRemoteControlledDialog'
import { PluginTraderMessages } from '../../Trader/messages'
import { useCallback } from 'react'
import type { EtherTokenDetailed, ERC20TokenDetailed } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { Coin } from '../../Trader/types'

const useStyles = makeStyles((theme) =>
    createStyles({
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
            alignItems: 'ledt',
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
    }),
)

interface PoolDeckProps {
    pool: Pool
    inputToken: EtherTokenDetailed | ERC20TokenDetailed
}

export function PoolViewDeck(props: PoolDeckProps) {
    const { pool, inputToken } = props

    const classes = useStyles()
    const { t } = useI18N()

    const account = useAccount()
    const blockie = useAvatar(pool.managerAddress)
    const chainId = useChainId()
    const poolUrl = usePoolURL(pool.address)

    //#region manager share
    const managerShare = Math.round((Number(pool.balanceOfManager) / Number(pool.totalSupply)) * 100 || 0)
    //#endregion

    //#region Swap
    const [_, openSwapDialog] = useRemoteControlledDialog(PluginTraderMessages.events.swapDialogUpdated, (ev) => {
        console.log(ev)
    })
    const openSwap = useCallback(() => {
        openSwapDialog({
            open: true,
            traderProps: {
                coin: {
                    id: inputToken.address,
                    name: inputToken.name ?? '',
                    symbol: inputToken.symbol ?? '',
                    eth_address: inputToken.address,
                    decimals: inputToken.decimals,
                } as Coin,
            },
        })
    }, [openSwapDialog])
    //#endregion    //#endregion

    return (
        <Card variant="outlined" className={classes.root} elevation={0}>
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
                                                href={resolveAddressLinkOnEtherscan(chainId, pool.managerAddress)}
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
                    <Button className={classes.button} variant="contained" fullWidth color="primary">
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
        </Card>
    )
}
