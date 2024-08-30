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
        switch (feed.type) {
            case Type.Mint:
                // If only one action, it should be free minting
                metadata = getLastAction(feed as RSS3BaseAPI.CollectibleMintFeed).metadata
                return (
                    <RSS3Trans.collectible_mint
                        values={{
                            user,
                            collectible: verbose ? metadata!.name : 'an NFT',
                            cost_value: formatValue(metadata?.cost),
                            cost_symbol: metadata?.cost?.symbol ?? '',
                            context: metadata?.cost ? 'cost' : 'no_cost',
                        }}
                        components={{
                            user: <Label />,
                            cost: <Label />,
                            collectible: verbose ? <Label /> : <span />,
                        }}
                    />
                )
            case Type.Trade:
                action = getLastAction(feed as RSS3BaseAPI.CollectibleTradeFeed)
                metadata = action.metadata
                const cost = getCost(feed as RSS3BaseAPI.CollectibleTradeFeed)
                return (
                    <RSS3Trans.collectible_trade
                        values={{
                            user,
                            collectible: verbose ? metadata!.name : 'an NFT',
                            recipient: formatEthereumAddress(action.to ?? '', 4),
                            cost_value: formatValue(cost),
                            cost_symbol: cost?.symbol ?? '',
                            platform: feed.platform!,
                            context: feed.platform ? 'platform' : 'no_platform',
                        }}
                        components={{
                            recipient: <AccountLabel address={action.to} />,
                            bold: <Label />,
                            collectible: verbose ? <Label /> : <span />,
                        }}
                    />
                )
            case Type.Transfer:
                if (isRegisteringENS(feed)) {
                    return (
                        <RSS3Trans.collectible_register_ens
                            values={{
                                user,
                                ens: verbose ? feed.actions[1].metadata!.name : 'an ENS',
                                cost_value: formatValue(
                                    (feed.actions[0] as RSS3BaseAPI.CollectibleTransferAction).metadata,
                                ),
                                cost_symbol: feed.actions[0].metadata?.symbol ?? '',
                            }}
                            components={{
                                user: <Label />,
                                cost: <Label />,
                                ens: verbose ? <Label /> : <span />,
                            }}
                        />
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
                return (
                    <RSS3Trans.collectible_operation
                        values={{
                            user,
                            collectible: verbose ? metadata!.name : 'an NFT',
                            other: formatEthereumAddress(otherAddress ?? '', 4),
                            context:
                                isSending ? 'send'
                                : costMetadata ? 'claim_cost'
                                : 'claim',
                            cost_value: formatValue(costMetadata),
                            cost_symbol: costMetadata?.symbol!,
                        }}
                        components={{
                            user: <Label />,
                            other: <AccountLabel address={otherAddress} />,
                            collectible: verbose ? <Label /> : <span />,
                            cost: <Label />,
                        }}
                    />
                )
            case Type.Burn:
                metadata = getLastAction(feed as RSS3BaseAPI.CollectibleBurnFeed).metadata
                return (
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
