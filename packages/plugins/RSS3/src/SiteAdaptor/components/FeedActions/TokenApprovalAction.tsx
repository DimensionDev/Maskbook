import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isGreaterThan, leftShift } from '@masknet/web3-shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { AccountLabel, Label } from '../common.js'

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
    const uiAmount = isGreaterThan(parsedAmount, '1e+10') ? 'infinite' : parsedAmount.toFixed(2)
    const content = (
        <Typography className={classes.summary} component="div">
            {/* eslint-disable-next-line react/naming-convention/component-name */}
            <RSS3Trans.tokenApproval
                values={{
                    user,
                    amount: uiAmount,
                    symbol: metadata!.symbol!,
                    contract: formatEthereumAddress(action.to!, 4),
                    context: metadata!.action,
                }}
                components={{
                    user: <AccountLabel address={owner.address} />,
                    asset: <Label />,
                    contract: <AccountLabel address={action.to!} />,
                }}
            />
        </Typography>
    )
    // Mixed in token operation actions
    return act ? content : <div {...rest}>{content}</div>
}
