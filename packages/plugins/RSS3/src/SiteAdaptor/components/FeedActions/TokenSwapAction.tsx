import { Trans } from '@lingui/react/macro'
import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { AccountLabel, formatValue, Label } from '../common.js'

const useStyles = makeStyles()((theme) => ({
    actions: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
    },
    summary: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
        overflow: 'auto',
        scrollbarWidth: 'none',
        whiteSpace: 'pre',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface TokenSwapActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenSwapFeed
}

/**
 * TokenSwapAction
 * Including:
 *
 * - TokenSwap
 */
export function TokenSwapAction({ feed, ...rest }: TokenSwapActionProps) {
    const { classes, cx } = useStyles()

    const user = useAddressLabel(feed.owner)

    return (
        <div {...rest} className={cx(rest.className, classes.actions)}>
            {feed.actions.map((action, index) => {
                const metadata = action.metadata
                const from_value = formatValue(metadata?.from)
                const from_symbol = metadata?.from.symbol ?? 'Unknown Token'
                const to_value = formatValue(metadata?.to)
                const to_symbol = metadata?.to.symbol ?? 'Unknown Token'
                const platform = feed.platform!
                return (
                    <Typography className={classes.summary} key={index} component="div">
                        <Trans>
                            <AccountLabel address={action.from!}>{user}</AccountLabel> swapped{' '}
                            <Label>
                                {from_value} {from_symbol}
                            </Label>{' '}
                            to{' '}
                            <Label>
                                {to_value} {to_symbol}
                            </Label>{' '}
                            on <Label title={feed.platform}>{platform}</Label>
                        </Trans>
                    </Typography>
                )
            })}
        </div>
    )
}
