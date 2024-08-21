import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { AddressLabel } from '../common.js'

const useStyles = makeStyles()((theme) => ({
    summary: {
        height: 20,
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'pre-wrap',
    },
}))

const { Tag } = RSS3BaseAPI

interface NoteActionProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.NoteFeed
}

/**
 * NoteAction
 * Including:
 *
 * - NoteMint
 * - NoteCreate
 * - NoteEdit
 * - NoteLink
 */
export function NoteAction({ feed, ...rest }: NoteActionProps) {
    const { classes } = useStyles()

    // You might see a collectible action on a note minting feed
    const action = feed.actions.filter((x) => x.tag === Tag.Social)[0]

    const user = useAddressLabel(feed.owner)
    const type = action.type

    return (
        <div {...rest}>
            <Typography className={classes.summary}>
                <RSS3Trans.note
                    values={{
                        user,
                        platform: action.platform!,
                        context: type,
                    }}
                    components={{
                        user: <AddressLabel address={feed.owner} />,
                    }}
                />
            </Typography>
        </div>
    )
}
