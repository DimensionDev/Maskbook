import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { Label } from '../common.js'

const useStyles = makeStyles()((theme) => ({
    action: {
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

interface CollectibleApprovalFeedActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.CollectibleApprovalFeed
}

/**
 * CollectibleApprovalAction.
 * Including:
 *
 * - CollectibleApproval
 */
export function CollectibleApprovalAction({ feed, ...rest }: CollectibleApprovalFeedActionProps) {
    const { classes } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const owner = useFeedOwner()
    const user = useAddressLabel(owner.address)

    return (
        <div {...rest}>
            <Typography className={classes.action} component="div">
                <RSS3Trans.collectible_approval
                    values={{
                        user,
                        collection: metadata?.collection!,
                        contract: formatEthereumAddress(action.to!, 4),
                        context: metadata?.action,
                    }}
                    components={{
                        bold: <Label />,
                    }}
                />
            </Typography>
        </div>
    )
}
