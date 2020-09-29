import { makeStyles, createStyles } from '@material-ui/core'
import type { RedPacketJSONPayload } from '../types'

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            display: 'flex',
            width: 400,
            height: '100%',
            flexDirection: 'column',
            margin: '0 auto',
        },
        scroller: {
            width: '100%',
            overflow: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        hint: {
            padding: theme.spacing(0.5, 1),
            border: `1px solid ${theme.palette.background.default}`,
            borderRadius: theme.spacing(1),
            margin: 'auto',
            cursor: 'pointer',
        },
    }),
)

export interface RedPacketOutboundListProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onSelect?: (payload: RedPacketJSONPayload) => void
}

export function RedPacketOutboundList(props: RedPacketOutboundListProps) {
    return null
}
