import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { useI18N } from '../../../locales/index.js'
import { Translate } from '../../../locales/i18n_generated.js'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardType } from '../share.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { formatValue, Label } from './common.js'

const useStyles = makeStyles<void, 'tokenIcon' | 'verboseToken'>()((theme, _, refs) => ({
    summary: {
        color: theme.palette.maskColor.third,
    },
    tokenIcon: {},
    verboseToken: {},
    token: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing(1),
        [`.${refs.tokenIcon}`]: {
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
        },
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
    const { verbose } = rest
    const t = useI18N()
    const { classes, cx } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const owner = useFeedOwner()
    const isFromOwner = isSameAddress(owner.address, action.address_from)

    const cardType = cardTypeMap[feed.type] || (isFromOwner ? CardType.TokenOut : CardType.TokenIn)
    const context = contextMap[feed.type] || (isFromOwner ? 'send' : 'claim')

    const from = useAddressLabel(action.address_from!)
    const to = useAddressLabel(action.address_to!)

    return (
        <CardFrame type={cardType} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                {verbose ? (
                    <Translate.token_operation_verbose
                        values={{
                            from,
                            to,
                            value: formatValue(metadata),
                            symbol: metadata!.symbol,
                            /* eslint-disable-next-line  @typescript-eslint/ban-ts-comment */
                            // @ts-ignore
                            exchange: action.platform!,
                            context,
                        }}
                        components={{
                            from: <Label title={action.address_from} />,
                            to: <Label title={action.address_to} />,
                            bold: <Label />,
                        }}
                    />
                ) : (
                    <Translate.token_operation
                        values={{
                            from,
                            to,
                            value: formatValue(metadata),
                            symbol: metadata!.symbol,
                            exchange: action.platform!,
                            context,
                        }}
                        components={{
                            from: <Label title={action.address_from} />,
                            to: <Label title={action.address_to} />,
                            bold: <Label />,
                        }}
                    />
                )}
            </Typography>
            {metadata ? (
                <div className={cx(classes.token, verbose ? classes.verboseToken : null)}>
                    <Image classes={{ container: classes.tokenIcon }} src={metadata?.image} height={40} width={40} />
                    <Typography className={classes.value}>
                        {t.token_value({
                            value: formatValue(metadata),
                            symbol: metadata.symbol,
                        })}
                    </Typography>
                </div>
            ) : null}
        </CardFrame>
    )
}
