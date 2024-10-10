import { Icons } from '@masknet/icons'
import { Stack, Typography, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useSharedTrans } from '@masknet/shared'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    item1: {
        color: theme.palette.maskColor.secondaryDark,
        fontSize: '14px',
        fontWeight: 700,
    },
    item2: {
        color: theme.palette.maskColor.dark,
        fontSize: '14px',
        fontWeight: 700,
        marginLeft: '2px',
    },
    linkOutIcon: {
        color: theme.palette.maskColor.dark,
    },
}))

export function PluginDescriptor() {
    const tr = useSharedTrans()
    const { classes } = useStyles()

    return (
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" width="100%">
            <Stack flexDirection="row" justifyContent="space-between" gap={1} alignItems="center">
                <Icons.Snapshot />
                <Typography fontWeight="bolder" fontSize={16} color={(theme) => theme.palette.maskColor.dark}>
                    <Trans>Snapshot</Trans>
                </Typography>
            </Stack>
            <Stack direction="row" gap={0.5}>
                <Typography className={classes.item1}>{tr.plugin_card_frame_default_provided_by()}</Typography>
                <Typography className={classes.item2}>{tr.plugin_card_frame_default_provided_by_value()}</Typography>
                <Link
                    underline="none"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="textPrimary"
                    href={'https://mask.io/'}
                    width="22px"
                    height="22px"
                    style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                    <Icons.LinkOut size={16} className={classes.linkOutIcon} />
                </Link>
            </Stack>
        </Stack>
    )
}
