import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
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
                return (
                    <Typography className={classes.summary} key={index} component="div">
                        {/* eslint-disable-next-line react/naming-convention/component-name */}
                        <RSS3Trans.tokenSwap
                            values={{
                                user,
                                from_value: formatValue(metadata?.from),
                                from_symbol: metadata?.from?.symbol ?? 'Unknown Token',
                                to_value: formatValue(metadata?.to),
                                to_symbol: metadata?.to?.symbol ?? 'Unknown Token',
                                platform: feed.platform!,
                            }}
                            components={{
                                user: <AccountLabel address={action.from!} />,
                                platform: <Label title={feed.platform} />,
                                bold: <Label />,
                            }}
                        />
                    </Typography>
                )
            })}
        </div>
    )
}
