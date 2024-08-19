import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useRSS3Trans } from '../../../locales/index.js'
import { useFeedOwner } from '../../contexts/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { AddressLabel, formatValue, Label } from './common.js'

const useStyles = makeStyles()((theme) => ({
    action: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
        overflow: 'auto',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

const { Tag, Type } = RSS3BaseAPI
type Type = RSS3BaseAPI.Type
export function isTokenOperationFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.TokenOperationFeed {
    const isTxTag = feed.tag === Tag.Transaction && [Type.Transfer, Type.Burn, Type.Mint].includes(feed.type)
    const isExchangeTag = feed.tag === Tag.Exchange && [Type.Deposit, Type.Withdraw].includes(feed.type)
    return isTxTag || isExchangeTag
}

interface TokenFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenOperationFeed
}

const cardTypeMap: Partial<Record<RSS3BaseAPI.Type, CardType>> = {
    [Type.Burn]: CardType.TokenBurn,
    [Type.Mint]: CardType.TokenMint,
    [Type.Withdraw]: CardType.TokenIn,
    [Type.Deposit]: CardType.TokenOut,
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
 * TokenOperationCard.
 * Including:
 *
 * - TokenMint
 * - TokenIn
 * - TokenOut
 * - TokenBurn
 */
export function TokenOperationCard({ feed, ...rest }: TokenFeedCardProps) {
    const t = useRSS3Trans()
    const { classes } = useStyles()

    const action = feed.actions.find((x) => x.from && x.to) || feed.actions[0]

    const owner = useFeedOwner()
    const isFromOwner = isSameAddress(owner.address, action.from)

    const cardType = cardTypeMap[feed.type] || (isFromOwner ? CardType.TokenOut : CardType.TokenIn)
    const context = contextMap[feed.type] || (isFromOwner ? 'send' : 'claim')

    return (
        <CardFrame type={cardType} feed={feed} {...rest}>
            {feed.actions.map((action, index) => {
                const metadata = action.metadata
                const asset = metadata ? t.token_value({ value: formatValue(metadata), symbol: metadata.symbol }) : ''
                return (
                    <Typography className={classes.action} key={index}>
                        <RSS3Trans.token_operation
                            values={{
                                from: action.from!,
                                to: action.to!,
                                value: formatValue(metadata),
                                symbol: metadata!.symbol,
                                exchange: action.platform!,
                                context,
                                asset,
                            }}
                            components={{
                                from: <AddressLabel address={action.from} />,
                                to: <AddressLabel address={action.to} />,
                                bold: <Label />,
                                asset: <Label />,
                            }}
                        />
                    </Typography>
                )
            })}
        </CardFrame>
    )
}
