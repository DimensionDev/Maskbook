import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Box, Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardType } from '../share.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { AddressLabel, formatValue, Label } from './common.js'

const useStyles = makeStyles()((theme) => ({
    summary: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflow: 'auto',
        scrollbarWidth: 'none',
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isTokenSwapFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.TokenSwapFeed {
    return feed.tag === Tag.Exchange && feed.type === Type.Swap
}

interface TokenSwapCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenSwapFeed
}

/**
 * TokenSwapCard
 * Including:
 *
 * - TokenSwap
 */
export function TokenSwapCard({ feed, ...rest }: TokenSwapCardProps) {
    const { classes } = useStyles()

    const user = useAddressLabel(feed.owner)

    return (
        <CardFrame type={CardType.TokenSwap} feed={feed} {...rest}>
            <Box display="flex" flexDirection="column" gap={0.5}>
                {feed.actions.map((action, index) => {
                    const metadata = action.metadata
                    return (
                        <Typography className={classes.summary} key={index}>
                            <RSS3Trans.token_swap
                                values={{
                                    user,
                                    from_value: formatValue(metadata?.from),
                                    from_symbol: metadata?.from.symbol ?? 'Unknown Token',
                                    to_value: formatValue(metadata?.to),
                                    to_symbol: metadata?.to.symbol ?? 'Unknown Token',
                                    platform: feed.platform!,
                                }}
                                components={{
                                    user: <AddressLabel address={action.from!} />,
                                    platform: <Label title={feed.platform} />,
                                    bold: <Label />,
                                }}
                            />
                        </Typography>
                    )
                })}
            </Box>
        </CardFrame>
    )
}
