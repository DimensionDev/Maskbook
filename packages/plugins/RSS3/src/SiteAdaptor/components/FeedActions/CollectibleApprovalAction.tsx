import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { Label } from '../common.js'
import { Select, Trans } from '@lingui/react/macro'

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
    const contract = formatEthereumAddress(action.to!, 4)
    return (
        <div {...rest}>
            <Typography className={classes.action} component="div">
                <Select
                    _approve={
                        <Trans>
                            <Label>{user}</Label> approved {metadata?.collection ?? 'Unknown'} to{' '}
                            <Label>{contract}</Label>
                        </Trans>
                    }
                    _revoke={
                        <Trans>
                            <Label>{user}</Label> approved {metadata?.collection ?? 'Unknown'} to{' '}
                            <Label>{contract}</Label>
                        </Trans>
                    }
                    value={metadata?.action}
                />
            </Typography>
        </div>
    )
}
