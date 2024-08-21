import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { Label, AddressLabel } from '../common.js'
import { TokenOperationAction } from './TokenOperationAction.js'

const useStyles = makeStyles()((theme) => ({
    summary: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'pre',
    },
}))

const { Tag, Type } = RSS3BaseAPI

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

    return (
        <div {...rest}>
            {feed.actions.map((action, index) => {
                if (action.tag === Tag.Transaction && action.type === Type.Mint) {
                    return (
                        <TokenOperationAction
                            feed={feed as RSS3BaseAPI.TokenOperationFeed}
                            action={action}
                            key={index}
                        />
                    )
                }
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
                                user: <AddressLabel address={action.from} />,
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
