import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isGreaterThan, leftShift } from '@masknet/web3-shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { AccountLabel, Label } from '../common.js'
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

interface TokenApprovalFeedActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenApprovalFeed
    // There could be approval action mixed in TokenOperationFeed
    action?: RSS3BaseAPI.TokenApprovalFeed['actions'][number]
}

/**
 * TokenApprovalAction.
 * Including:
 *
 * - TokenApproval
 */
export function TokenApprovalAction({ feed, action: act, ...rest }: TokenApprovalFeedActionProps) {
    const { classes } = useStyles()

    const action = act || feed.actions.find((x) => x.metadata?.action) || feed.actions[0]
    const metadata = action.metadata

    const owner = useFeedOwner()

    const user = useAddressLabel(owner.address)

    const parsedAmount = leftShift(metadata!.value, metadata?.decimals)
    const amount = isGreaterThan(parsedAmount, '1e+10') ? 'infinite' : parsedAmount.toFixed(2)
    const symbol = metadata!.symbol!
    const contract = formatEthereumAddress(action.to!, 4)
    const context = metadata!.action
    const content = (
        <Typography className={classes.summary} component="div">
            <Select
                _approve={
                    <Trans>
                        <AccountLabel address={owner.address}>{user}</AccountLabel> approved{' '}
                        <Label>
                            {amount} {symbol}
                        </Label>{' '}
                        to <AccountLabel address={action.to!}>{contract}</AccountLabel>
                    </Trans>
                }
                _revoke={
                    <Trans>
                        <AccountLabel address={owner.address}>{user}</AccountLabel> revoked the approval of{' '}
                        <Label>
                            {amount} {symbol}
                        </Label>{' '}
                        to <AccountLabel address={action.to!}>{contract}</AccountLabel>
                    </Trans>
                }
                value={context}
            />
        </Typography>
    )
    // Mixed in token operation actions
    return act ? content : <div {...rest}>{content}</div>
}
