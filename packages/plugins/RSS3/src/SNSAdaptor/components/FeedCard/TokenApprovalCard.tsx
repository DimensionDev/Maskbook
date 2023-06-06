import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isGreaterThan } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import { Translate } from '../../../locales/i18n_generated.js'
import { useFeedOwner } from '../../contexts/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardType } from '../share.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { Label } from './common.js'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'

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
export function isTokenApprovalFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.TokenApprovalFeed {
    return feed.tag === Tag.Transaction && feed.type === Type.Approval
}

interface TokenApprovalFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenApprovalFeed
}

/**
 * TokenApprovalCard.
 * Including:
 *
 * - TokenApproval
 */
export const TokenApprovalCard: FC<TokenApprovalFeedCardProps> = ({ feed, ...rest }) => {
    const { verbose } = rest
    const { classes, cx } = useStyles()

    const action = feed.actions[0]
    const metadata = action.metadata

    const owner = useFeedOwner()

    const user = useAddressLabel(owner.address)

    const amount = isGreaterThan(metadata!.value, '1e+10') ? 'infinite' : metadata?.value_display!

    return (
        <CardFrame type={CardType.TokenApproval} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                {verbose ? (
                    <Translate.token_approval_verbose
                        values={{
                            user,
                            amount,
                            symbol: metadata!.symbol!,
                            context: metadata!.action,
                        }}
                        components={{
                            bold: <Label />,
                        }}
                    />
                ) : (
                    <Translate.token_approval
                        values={{
                            user,
                            amount: isGreaterThan(metadata!.value, '1e+10') ? 'infinite' : metadata?.value_display!,
                            symbol: metadata!.symbol!,
                            contract: formatEthereumAddress(action.address_to!, 4),
                            context: metadata!.action,
                        }}
                        components={{
                            bold: <Label />,
                        }}
                    />
                )}
            </Typography>
            {metadata ? (
                <div className={cx(classes.token, verbose ? classes.verboseToken : null)}>
                    <Image classes={{ container: classes.tokenIcon }} src={metadata.image} height={40} width={40} />
                    <Typography className={classes.value}>{`${amount} ${metadata.symbol}`}</Typography>
                </div>
            ) : null}
        </CardFrame>
    )
}
