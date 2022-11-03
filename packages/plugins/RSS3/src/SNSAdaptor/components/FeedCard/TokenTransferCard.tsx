import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import { useI18N } from '../../../locales'
import { Translate } from '../../../locales/i18n_generated'
import { useFeedOwner } from '../../contexts'
import { useAddressLabel } from '../../hooks'
import { CardType } from '../share'
import { CardFrame, FeedCardProps } from '../base'
import { formatValue, Label } from './common'

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
export function isTokenTransferFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.TokenTransferFeed {
    return feed.tag === Tag.Transaction && feed.type === Type.Transfer
}

interface TokenFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenTransferFeed
}

/**
 * TokenTransferCard.
 * Including:
 *
 * TokenIn
 * TokenOut
 */
export const TokenTransferCard: FC<TokenFeedCardProps> = ({ feed, ...rest }) => {
    const { verbose } = rest
    const t = useI18N()
    const { classes, cx } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const owner = useFeedOwner()
    const isFromOwner = isSameAddress(owner.address, action.address_from)

    const cardType = isFromOwner ? CardType.TokenOut : CardType.TokenIn

    const from = useAddressLabel(action.address_from!)
    const to = useAddressLabel(action.address_to!)

    return (
        <CardFrame type={cardType} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                {verbose ? (
                    <Translate.token_transfer_verbose
                        values={{
                            from,
                            to,
                            value: formatValue(metadata!),
                            symbol: metadata!.symbol,
                            context: isFromOwner ? 'send' : 'claim',
                        }}
                        components={{
                            from: <Label title={action.address_from!} />,
                            to: <Label title={action.address_to!} />,
                            bold: <Label />,
                        }}
                    />
                ) : (
                    <Translate.token_transfer
                        values={{
                            from,
                            to,
                            context: isFromOwner ? 'send' : 'claim',
                        }}
                        components={{
                            from: <Label title={action.address_from!} />,
                            to: <Label title={action.address_to!} />,
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
