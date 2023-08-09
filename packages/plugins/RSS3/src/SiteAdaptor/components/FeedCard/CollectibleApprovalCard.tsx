import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { Translate } from '../../../locales/i18n_generated.js'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { Label } from './common.js'

const useStyles = makeStyles<void, 'verboseToken'>()((theme, _, refs) => ({
    summary: {
        color: theme.palette.maskColor.third,
    },
    verboseToken: {},
    token: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing(1),
        [`&.${refs.verboseToken}`]: {
            height: 186,
            justifyContent: 'center',
        },
    },
    value: {
        color: theme.palette.maskColor.main,
        marginLeft: theme.spacing(1.5),
        fontSize: 14,
        fontWeight: 700,
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isCollectibleApprovalFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.CollectibleApprovalFeed {
    return feed.tag === Tag.Collectible && feed.type === Type.Approval
}

interface CollectibleApprovalFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.CollectibleApprovalFeed
}

/**
 * CollectibleApprovalCard.
 * Including:
 *
 * - CollectibleApproval
 */
export function CollectibleApprovalCard({ feed, ...rest }: CollectibleApprovalFeedCardProps) {
    const { verbose } = rest
    const { classes, cx } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const owner = useFeedOwner()
    const user = useAddressLabel(owner.address)

    return (
        <CardFrame type={CardType.CollectibleApproval} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                <Translate.collectible_approval
                    values={{
                        user,
                        collection: metadata?.collection!,
                        contract: formatEthereumAddress(action.address_to!, 4),
                        context: metadata?.action,
                    }}
                    components={{
                        bold: <Label />,
                    }}
                />
            </Typography>
            {metadata ? (
                <div className={cx(classes.token, verbose ? classes.verboseToken : null)}>
                    <Typography className={classes.value}>{metadata.collection}</Typography>
                </div>
            ) : null}
        </CardFrame>
    )
}
