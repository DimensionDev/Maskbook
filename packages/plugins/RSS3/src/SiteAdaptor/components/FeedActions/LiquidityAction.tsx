import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { Label } from '../common.js'

const useStyles = makeStyles()((theme) => ({
    summary: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
    },
}))

const { Tag } = RSS3BaseAPI

interface TokenFeedActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.LiquidityFeed
}

/**
 * LiquidityAction.
 * Including:
 *
 * - TokenIn
 * - TokenOut
 * - UnknownBurn
 */
export function LiquidityAction({ feed, ...rest }: TokenFeedActionProps) {
    const { classes } = useStyles()

    const owner = useFeedOwner()
    const user = useAddressLabel(owner.address)

    // You might see two transaction actions in a liquidity feed as well
    const actions = feed.actions.filter((x) => x.tag === Tag.Exchange)

    return (
        <div {...rest}>
            {actions.map((action, index) => {
                const metadata = action.metadata

                return (
                    <Typography className={classes.summary} key={index}>
                        <RSS3Trans.liquidity
                            values={{
                                user,
                                platform: feed.platform!,
                                context: metadata?.action!,
                            }}
                            components={{
                                user: <Label title={action.from} />,
                                platform: <Label />,
                                bold: <Label />,
                            }}
                        />
                    </Typography>
                )
            })}
        </div>
    )
}
