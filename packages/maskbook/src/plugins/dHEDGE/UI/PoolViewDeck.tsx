import { makeStyles, createStyles, Card, Typography, Grid, Divider, Link, Avatar } from '@material-ui/core'
import type { Pool } from '../types'
import { resolveAddressLinkOnEtherscan } from '../../../web3/pipes'
import { useAvatar } from '../hooks/useManager'
import { Trans } from 'react-i18next'
import { useChainId } from '../../../web3/hooks/useBlockNumber'
import { usePoolURL } from '../hooks/useUrl'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            padding: theme.spacing(2),
        },
        title: {
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
            '& > :last-child': {
                marginTop: 4,
                marginLeft: 4,
            },
        },
        meta: {
            fontSize: 16,
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
            '& svg': {
                marginRight: theme.spacing(0.5),
            },
        },
        avatar: {
            width: theme.spacing(8),
            height: theme.spacing(8),
            margin: theme.spacing(0, 1),
        },
        text: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            '-webkit-line-clamp': '4',
            '-webkit-box-orient': 'vertical',
        },
    }),
)

interface PoolDeckDeckProps {
    pool: Pool
}

export function PoolViewDeck(props: PoolDeckDeckProps) {
    const { pool } = props

    const classes = useStyles()
    const chainId = useChainId()
    const blockie = useAvatar(pool.managerAddress)
    const poolUrl = usePoolURL(pool.address)

    const managerShare = Math.round(((Number(pool.balanceOfManager) / Number(pool.totalSupply)) * 100) | 0)

    return (
        <Card variant="outlined" className={classes.root} elevation={0}>
            <Grid container className={classes.meta} direction="row" spacing={0.5}>
                <Grid item>
                    <Link target="_blank" rel="noopener noreferrer" href={poolUrl}>
                        <Avatar src={blockie} className={classes.avatar} />
                    </Link>
                </Grid>
                <Grid item>
                    <div className={classes.title}>
                        <Link color="primary" target="_blank" rel="noopener noreferrer" href={poolUrl}>
                            <Typography variant="h6">{pool.name.toUpperCase()}</Typography>
                        </Link>
                    </div>
                    <Grid container className={classes.meta} direction="row" spacing={0.5}>
                        <Grid item>
                            <Typography variant="body2" color="textSecondary" className={classes.text}>
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
                            <Divider orientation="vertical" flexItem className={classes.text} />
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
            </Grid>
        </Card>
    )
}
