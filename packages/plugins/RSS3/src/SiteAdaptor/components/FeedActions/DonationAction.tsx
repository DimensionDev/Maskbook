import { makeStyles } from '@masknet/theme'
import { type RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { formatValue, Label } from '../common.js'

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
                    return (
                        <Typography className={classes.summary} key={index}>
                            <RSS3Trans.donation_donate_verbose
                                values={{
                                    user,
                                    cost_value: formatValue(metadata?.token),
                                    cost_symbol: metadata?.token?.symbol ?? 'Unknown Token',
                                    project: action.metadata?.title ?? 'Unknown Project',
                                }}
                                components={{
                                    bold: <Label />,
                                }}
                            />
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
                return (
                    <Typography className={classes.summary} key={index} component="div">
                        <RSS3Trans.donation_donate
                            values={{
                                user,
                                cost_value: formatValue(metadata?.token),
                                cost_symbol: metadata?.token?.symbol ?? 'Unknown Token',
                            }}
                            components={{
                                bold: <Label />,
                            }}
                        />
                    </Typography>
                )
            })}
        </div>
    )
}
