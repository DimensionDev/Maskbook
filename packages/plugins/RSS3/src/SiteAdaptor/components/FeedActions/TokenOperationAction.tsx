import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useRSS3Trans } from '../../../locales/index.js'
import { useFeedOwner } from '../../contexts/index.js'
import { type FeedCardProps } from '../base.js'
import { AddressLabel, formatValue, Label } from '../common.js'
import { TokenApprovalAction } from './TokenApprovalAction.js'

const useStyles = makeStyles()((theme) => ({
    actions: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
    },
    action: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
        overflow: 'auto',
        textOverflow: 'ellipsis',
        whiteSpace: 'pre',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

const { Tag, Type } = RSS3BaseAPI
type Type = RSS3BaseAPI.Type

interface TokenFeedActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenOperationFeed
    /** If action is set, feed will be discarded */
    action?: RSS3BaseAPI.TokenOperationFeed['actions'][number]
}

const contextMap: Partial<
    Record<
        RSS3BaseAPI.Type,
        RSS3BaseAPI.Type.Burn | RSS3BaseAPI.Type.Mint | RSS3BaseAPI.Type.Withdraw | RSS3BaseAPI.Type.Deposit
    >
> = {
    [Type.Burn]: Type.Burn,
    [Type.Mint]: Type.Mint,
    [Type.Withdraw]: Type.Withdraw,
    [Type.Deposit]: Type.Deposit,
}

/**
 * TokenOperationAction.
 * Including:
 *
 * - TokenMint
 * - TokenIn
 * - TokenOut
 * - TokenBurn
 */
export function TokenOperationAction({ feed, action, ...rest }: TokenFeedActionProps) {
    const t = useRSS3Trans()
    const { classes, cx } = useStyles()

    const owner = useFeedOwner()

    const actions = action ? [action] : feed.actions

    const content = (
        <>
            {actions.map((action, index) => {
                const metadata = action.metadata
                const asset = metadata ? t.token_value({ value: formatValue(metadata), symbol: metadata.symbol }) : ''
                const isFromOwner = isSameAddress(owner.address, action.from)
                // Always treat as send action
                const sender = isFromOwner ? action.from! : action.to!
                const receiver = isFromOwner ? action.to! : action.from!

                if (action.tag === Tag.Transaction && action.type === Type.Approval) {
                    return (
                        <TokenApprovalAction
                            feed={feed as RSS3BaseAPI.TokenApprovalFeed}
                            action={
                                action as RSS3BaseAPI.ActionGeneric<
                                    RSS3BaseAPI.Tag.Transaction,
                                    RSS3BaseAPI.Type.Approval
                                >
                            }
                            key={index}
                        />
                    )
                }

                const type = action ? action.type : feed.type
                const context = contextMap[type] || 'send'
                return (
                    <Typography className={classes.action} key={index} component="div">
                        <RSS3Trans.tokenOperation
                            values={{
                                from: sender,
                                to: receiver,
                                value: formatValue(metadata),
                                symbol: metadata!.symbol,
                                exchange: action.platform!,
                                context,
                                asset,
                            }}
                            components={{
                                from: <AddressLabel address={sender} />,
                                to: <AddressLabel address={receiver} />,
                                bold: <Label />,
                                asset: <Label />,
                            }}
                        />
                    </Typography>
                )
            })}
        </>
    )

    return (
        <div {...rest} className={cx(rest.className, classes.actions)}>
            {content}
        </div>
    )
}
