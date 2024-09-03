import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
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

const { Type } = RSS3BaseAPI

interface StakingFeedActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.StakingFeed
}

/**
 * StakingAction.
 * Including:
 *
 * - TokenStake
 * - TokenUnstake
 */
export function StakingAction({ feed, ...rest }: StakingFeedActionProps) {
    const { classes } = useStyles()

    const action = feed.actions.find((x) => x.type === Type.Staking)
    const metadata = action?.metadata

    const owner = useFeedOwner()
    const user = useAddressLabel(owner.address)

    const symbol = metadata?.token?.symbol
    const actionType = metadata?.action
    if (!symbol || !actionType) return null
    return (
        <div {...rest}>
            <Typography className={classes.summary} component="div">
                <RSS3Trans.tokenStaking
                    values={{
                        user,
                        symbol,
                        context: actionType,
                    }}
                    components={{
                        bold: <Label />,
                        user: <AccountLabel address={owner.address} />,
                    }}
                />
            </Typography>
        </div>
    )
}
