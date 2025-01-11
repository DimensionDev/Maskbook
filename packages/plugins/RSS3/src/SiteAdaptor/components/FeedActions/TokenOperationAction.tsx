import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Button, Typography } from '@mui/material'
import { useState } from 'react'
import { useFeedOwner } from '../../contexts/index.js'
import { type FeedCardProps } from '../base.js'
import { AccountLabel, formatValue, Label } from '../common.js'
import { TokenApprovalAction } from './TokenApprovalAction.js'
import { Select, Trans } from '@lingui/react/macro'

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
    const { classes, cx } = useStyles()

    const owner = useFeedOwner()
    const [expanded, setExpanded] = useState(false)

    const actions =
        action ? [action]
        : expanded ? feed.actions
        : feed.actions.slice(0, 3)

    const content = (
        <>
            {actions.map((action, index) => {
                const metadata = action.metadata
                const asset = metadata ? `${formatValue(metadata)} ${metadata.symbol}` : ''
                const isFromOwner = isSameAddress(owner.address, action.from)
                // Always treat as send action
                const from = isFromOwner ? action.from! : action.to!
                const to = isFromOwner ? action.to! : action.from!

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
                const value = formatValue(metadata)
                const symbol = metadata!.symbol
                const exchange = action.platform!
                return (
                    <Typography className={classes.action} key={index} component="div">
                        <Select
                            _mint={
                                <Trans>
                                    <AccountLabel address={to}>{to}</AccountLabel> minted{' '}
                                    <Label>
                                        {value} {symbol}
                                    </Label>
                                </Trans>
                            }
                            _send={
                                <Trans>
                                    <AccountLabel address={from}>{from}</AccountLabel> sent <Label>{asset}</Label> to{' '}
                                    <AccountLabel address={to}>{to}</AccountLabel>
                                </Trans>
                            }
                            _claim={
                                <Trans>
                                    <AccountLabel address={to}>{to}</AccountLabel> claimed from{' '}
                                    <AccountLabel address={from}>{from}</AccountLabel>
                                </Trans>
                            }
                            _burn={
                                <Trans>
                                    <AccountLabel address={from}>{from}</AccountLabel> burned{' '}
                                    <Label>
                                        {value} {symbol}
                                    </Label>
                                </Trans>
                            }
                            _deposit={
                                <Trans>
                                    <AccountLabel address={from}>{from}</AccountLabel> deposited on{' '}
                                    <Label>{exchange}</Label>
                                </Trans>
                            }
                            _withdraw={
                                <Trans>
                                    <AccountLabel address={from}>{from}</AccountLabel> withdrew on{' '}
                                    <Label>{exchange}</Label>
                                </Trans>
                            }
                            value={context}
                        />
                    </Typography>
                )
            })}
            {feed.actions.length > 3 && !action ?
                <Button
                    disableRipple
                    variant="text"
                    sx={{
                        display: 'inline-block',
                        alignSelf: 'flex-start',
                        padding: 0,
                        minWidth: 0,
                    }}
                    onClick={(evt) => {
                        evt.stopPropagation()
                        setExpanded((v) => !v)
                    }}>
                    {expanded ?
                        <Icons.ArrowUp2 size={24} />
                    :   <Icons.More size={24} />}
                </Button>
            :   null}
        </>
    )

    return (
        <div {...rest} className={cx(rest.className, classes.actions)}>
            {content}
        </div>
    )
}
