import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { formatValue, Label } from '../common.js'
import { Trans } from '@lingui/react/macro'

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

interface DonationActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.DonationFeed
}

/**
 * DonationAction
 * Including:
 *
 * - DonationDonate
 */
export function DonationAction({ feed, verbose, ...rest }: DonationActionProps) {
    const { classes } = useStyles()

    // Might mixin a transaction action
    const availableActions = feed.actions.filter((x) => x.metadata?.title)

    const user = useAddressLabel(feed.owner)

    if (verbose) {
        return (
            <div {...rest}>
                {availableActions.map((action, index) => {
                    const metadata = action.metadata
                    const costSymbol = metadata?.token?.symbol ?? 'Unknown Token'
                    const project = action.metadata?.title ?? 'Unknown Project'
                    const costValue = formatValue(metadata?.token)
                    return (
                        <Typography className={classes.summary} key={index}>
                            <Trans>
                                <Label>{user}</Label> donated{' '}
                                <Label>
                                    {costValue} {costSymbol}
                                </Label>{' '}
                                to <Label>{project}</Label>
                            </Trans>
                        </Typography>
                    )
                })}
            </div>
        )
    }

    return (
        <div {...rest}>
            {availableActions.map((action, index) => {
                const metadata = action.metadata
                const costValue = formatValue(metadata?.token)
                const costSymbol = metadata?.token?.symbol ?? 'Unknown Token'
                return (
                    <Typography className={classes.summary} key={index} component="div">
                        <Trans>
                            <Label>{user}</Label> donated{' '}
                            <Label>
                                {costValue} {costSymbol}
                            </Label>
                        </Trans>
                    </Typography>
                )
            })}
        </div>
    )
}
