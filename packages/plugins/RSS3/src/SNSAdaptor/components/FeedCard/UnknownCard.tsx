import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import type { FC } from 'react'
import { useFeedOwner } from '../../contexts/index.js'
import { CardType } from '../share.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { Translate } from '../../../locales/index.js'
import { useAddressLabel } from '../../hooks/index.js'
import { Label } from './common.js'

const useStyles = makeStyles()((theme) => ({
    summary: {
        color: theme.palette.maskColor.third,
    },
}))

interface TokenFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.Web3Feed
}

export const UnknownCard: FC<TokenFeedCardProps> = ({ feed, ...rest }) => {
    const { classes, theme } = useStyles()

    const action = feed.actions[0]

    const user = useAddressLabel(feed.owner)
    const targetUser = useAddressLabel(feed.address_to)
    const owner = useFeedOwner()
    const isFromOwner = isSameAddress(owner.address, action.address_from)

    const cardType = isFromOwner ? CardType.UnknownOut : CardType.UnknownIn

    return (
        <CardFrame type={cardType} feed={feed} {...rest}>
            <Typography className={classes.summary}>
                <Translate.carry_out_activity
                    values={{
                        user,
                        target: targetUser,
                        platform: feed.platform!,
                    }}
                    components={{
                        bold: <Label />,
                    }}
                />
            </Typography>
            {process.env.NODE_ENV === 'development' ? (
                <Typography color={theme.palette.maskColor.danger}>
                    Unknown feed. Tag: {feed.tag}, Type: {feed.type}, {feed.actions.length} actions
                </Typography>
            ) : null}
        </CardFrame>
    )
}
