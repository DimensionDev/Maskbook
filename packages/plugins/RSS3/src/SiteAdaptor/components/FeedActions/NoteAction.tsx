import { NameServiceID, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { RSS3Trans } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { type FeedCardProps } from '../base.js'
import { AccountLabel } from '../common.js'

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

const { Tag, Type } = RSS3BaseAPI

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
    const type = action.type

    const owner = useAddressLabel(
        feed.owner,
        NetworkPluginID.PLUGIN_EVM,
        feed.platform === 'Lens' ? NameServiceID.Lens : undefined,
    )
    const user = action.metadata?.handle || owner
    const handle = type === Type.Mint || type === Type.Share ? owner : action.metadata?.handle

    return (
        <div {...rest}>
            <Typography className={classes.summary} component="div">
                {/* eslint-disable-next-line react/naming-convention/component-name */}
                <RSS3Trans.note
                    values={{
                        user,
                        platform: action.platform!,
                        context: type,
                    }}
                    components={{
                        user: <AccountLabel address={feed.owner} handle={handle} />,
                    }}
                />
            </Typography>
        </div>
    )
}
