import { Box, makeStyles, AvatarGroup, Link } from '@material-ui/core'
import { TokenIcon } from '@masknet/shared'
import { Hop, TradeProvider } from '../../types'
import { resolveTradePairLink } from '../../pipes'
import { getNetworkTypeFromChainId, useChainId } from '@masknet/web3-shared'

const useStyles = makeStyles((theme) => ({
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
    const classes = useStyles()
    const chainId = useChainId()
    const networkType = getNetworkTypeFromChainId(chainId)

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
