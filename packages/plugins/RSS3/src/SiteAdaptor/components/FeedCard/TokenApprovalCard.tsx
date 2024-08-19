import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isGreaterThan } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardType } from '../share.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { AddressLabel, Label } from './common.js'

const useStyles = makeStyles()((theme) => ({
    summary: {
        color: theme.palette.maskColor.third,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'pre',
        gap: 6,
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isTokenApprovalFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.TokenApprovalFeed {
    return feed.tag === Tag.Transaction && feed.type === Type.Approval
}

interface TokenApprovalFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenApprovalFeed
}

/**
 * TokenApprovalCard.
 * Including:
 *
 * - TokenApproval
 */
export function TokenApprovalCard({ feed, ...rest }: TokenApprovalFeedCardProps) {
    const { classes } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const owner = useFeedOwner()

    const user = useAddressLabel(owner.address)

    return (
        <CardFrame type={CardType.TokenApproval} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                <RSS3Trans.token_approval
                    values={{
                        user,
                        amount: isGreaterThan(metadata!.value, '1e+10') ? 'infinite' : metadata?.value_display!,
                        symbol: metadata!.symbol!,
                        contract: formatEthereumAddress(action.to!, 4),
                        context: metadata!.action,
                    }}
                    components={{
                        user: <AddressLabel address={owner.address} />,
                        asset: <Label />,
                        contract: <AddressLabel address={action.to!} />,
                    }}
                />
            </Typography>
        </CardFrame>
    )
}
