import { Box, AvatarGroup, Link } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { TokenIcon } from '@masknet/shared'
import { useNetworkType } from '@masknet/web3-shared-evm'
import { TradeProvider } from '@masknet/public-api'
import type { Hop } from '../../types'
import { resolveTradePairLink } from '../../pipes'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        borderRadius: 500,
        padding: theme.spacing(0.25),
        '&:hover': {
            backgroundColor: theme.palette.background.default,
        },
    },
    link: {
        display: 'flex',
        alignItems: 'center',
    },
}))

export interface TradeRouteHopProps {
    hop: Hop
}

export function TradeRouteHop(props: TradeRouteHopProps) {
    const { hop } = props
    const { classes } = useStyles()
    const networkType = useNetworkType()

    return (
        <div className={classes.root}>
            <AvatarGroup
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                }}
                max={8}>
                <Link
                    className={classes.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={resolveTradePairLink(TradeProvider.BALANCER, hop.pool.address, networkType)}>
                    {hop.pool.tokens.map((token) => (
                        <Box display="flex" alignItems="center" key={token.address}>
                            <TokenIcon address={token.address} />
                        </Box>
                    ))}
                </Link>
            </AvatarGroup>
        </div>
    )
}
