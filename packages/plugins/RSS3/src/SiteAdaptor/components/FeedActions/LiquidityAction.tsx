import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { Label, AccountLabel } from '../common.js'
import { TokenOperationAction } from './TokenOperationAction.js'
import { Select, Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => ({
    summary: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'pre',
        overflow: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
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
                    <Typography className={classes.summary} key={index} component="div">
                        <Trans>
                            <AccountLabel address={action.from}>{user}</AccountLabel>{' '}
                            <Select
                                _supply="supplied"
                                _add="added"
                                _repay="repaid"
                                _withdraw="withdrew"
                                _collect="collected"
                                _remove="removed"
                                _borrow="borrowed"
                                value={metadata?.action}
                            />{' '}
                            liquidity on <Label>{feed.platform!}</Label>
                        </Trans>
                    </Typography>
                )
            })}
        </div>
    )
}
