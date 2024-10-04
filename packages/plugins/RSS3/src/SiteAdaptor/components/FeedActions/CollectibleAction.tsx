import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { useMemo } from 'react'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { getCost, getLastAction } from '../share.js'
import { AccountLabel, formatValue, Label, isRegisteringENS } from '../common.js'
import { Select, Trans } from '@lingui/macro'

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

const { Type } = RSS3BaseAPI

interface CollectibleActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.CollectibleFeed
}

/**
 * CollectibleAction
 * Including:
 *
 * - CollectibleIn
 * - CollectibleBurn
 * - CollectibleIn
 * - CollectibleMint
 * - CollectibleOut
 */
export function CollectibleAction({ feed, ...rest }: CollectibleActionProps) {
    const { verbose } = rest
    const { classes } = useStyles()

    const user = useAddressLabel(feed.owner)

    const summary = useMemo(() => {
        let action
        let metadata
        const Tag = verbose ? Label : 'span'
        switch (feed.type) {
            case Type.Mint:
                // If only one action, it should be free minting
                metadata = getLastAction(feed as RSS3BaseAPI.CollectibleMintFeed).metadata
                if (metadata?.cost) {
                    const value = formatValue(metadata?.cost)
                    const symbolName = metadata?.cost?.symbol ?? ''
                    if (verbose)
                        return (
                            <Trans>
                                <Label>{user}</Label> minted <Tag>{metadata!.name}</Tag> for{' '}
                                <Label>
                                    {value} {symbolName}
                                </Label>
                            </Trans>
                        )
                    return (
                        <Trans>
                            <Label>{user}</Label> minted <Tag>an NFT</Tag> for{' '}
                            <Label>
                                {value} {symbolName}
                            </Label>
                        </Trans>
                    )
                }
                return (
                    <Trans>
                        <Label children={user} /> minted <Tag children={verbose ? metadata!.name : 'an NFT'} />
                    </Trans>
                )
            case Type.Trade: {
                action = getLastAction(feed as RSS3BaseAPI.CollectibleTradeFeed)
                metadata = action.metadata
                const cost = getCost(feed as RSS3BaseAPI.CollectibleTradeFeed)
                const recipient = formatEthereumAddress(action.to ?? '', 4)
                const symbolName = cost?.symbol ?? ''
                if (feed.platform) {
                    if (verbose)
                        return (
                            <Trans>
                                <Label>{user}</Label> sold <Tag>{metadata!.name}</Tag> to{' '}
                                <AccountLabel address={action.to}>{recipient}</AccountLabel> for{' '}
                                <Label>
                                    {formatValue(cost)} {symbolName}
                                </Label>{' '}
                                on <Label>{feed.platform}</Label>
                            </Trans>
                        )
                    else
                        return (
                            <Trans>
                                <Label>{user}</Label> sold <Tag>an NFT</Tag> to{' '}
                                <AccountLabel address={action.to}>{recipient}</AccountLabel> for{' '}
                                <Label>
                                    {formatValue(cost)} {symbolName}
                                </Label>{' '}
                                on <Label>{feed.platform}</Label>
                            </Trans>
                        )
                } else {
                    if (verbose)
                        return (
                            <Trans>
                                <Label>{user}</Label> sold <Tag>{metadata!.name}</Tag> to{' '}
                                <AccountLabel address={action.to}>{recipient}</AccountLabel> for{' '}
                                <Label>
                                    {formatValue(cost)} {symbolName}
                                </Label>
                            </Trans>
                        )
                    else
                        return (
                            <Trans>
                                <Label>{user}</Label> sold <Tag>an NFT</Tag> to{' '}
                                <AccountLabel address={action.to}>{recipient}</AccountLabel> for{' '}
                                <Label>
                                    {formatValue(cost)} {symbolName}
                                </Label>
                            </Trans>
                        )
                }
            }
            case Type.Transfer:
                if (isRegisteringENS(feed)) {
                    const Tag = verbose ? Label : 'span'
                    const costValue = formatValue((feed.actions[0] as RSS3BaseAPI.CollectibleTransferAction).metadata)
                    const costSymbol = feed.actions[0].metadata?.symbol ?? ''
                    if (verbose)
                        return (
                            <Trans>
                                <Label>{user}</Label> registered <Tag>{feed.actions[1].metadata!.name}</Tag> for{' '}
                                <Label>
                                    {costValue} {costSymbol}
                                </Label>
                            </Trans>
                        )
                    else
                        return (
                            <Trans>
                                <Label>{user}</Label> registered <Tag>an ENS</Tag> for{' '}
                                <Label>
                                    {costValue} {costSymbol}
                                </Label>
                            </Trans>
                        )
                }
                action = getLastAction(feed as RSS3BaseAPI.CollectibleTransferFeed)
                metadata = action.metadata
                const standard = feed.actions[0].metadata?.standard
                const costMetadata: RSS3BaseAPI.TransactionMetadata | undefined =
                    standard && ['Native', 'ERC-20'].includes(standard) ?
                        (feed.actions[0].metadata as RSS3BaseAPI.TransactionMetadata)
                    :   undefined
                const isSending = isSameAddress(feed.owner, action.from)
                const otherAddress = isSending ? action.to : action.from
                const Tag = verbose ? Label : 'span'
                const formattedAddress = formatEthereumAddress(otherAddress ?? '', 4)
                return (
                    <Trans>
                        <Label>{user}</Label>{' '}
                        <Select value={isSending ? 'send' : 'claim'} _send="sent" _claim="claimed" />{' '}
                        <Select
                            value={verbose ? 'verbose' : 'simple'}
                            _verbose={<Tag>{metadata!.name}</Tag>}
                            _simple={<Tag>an NFT</Tag>}
                        />{' '}
                        <Select value={isSending ? 'send' : 'claim'} _send="to" _claim="from" />{' '}
                        <AccountLabel address={formattedAddress}>{formattedAddress}</AccountLabel>
                        <Select
                            value={costMetadata ? 'cost' : 'free'}
                            _cost={` for ${formatValue(costMetadata)} ${costMetadata?.symbol ?? 'Unknown'}`}
                            _free=""
                        />
                    </Trans>
                )
            case Type.Burn:
                metadata = getLastAction(feed as RSS3BaseAPI.CollectibleBurnFeed).metadata
                return (
                    // eslint-disable-next-line react/naming-convention/component-name
                    <RSS3Trans.collectible_burn
                        values={{
                            user,
                            collectible: verbose ? metadata!.name : 'an NFT',
                        }}
                        components={{
                            user: <Label />,
                            collectible: verbose ? <Label /> : <span />,
                        }}
                    />
                )
        }

        return null
    }, [feed, user])

    if (!summary) return null

    return (
        <div {...rest}>
            <Typography className={classes.summary} component="div">
                {summary}
            </Typography>
        </div>
    )
}
