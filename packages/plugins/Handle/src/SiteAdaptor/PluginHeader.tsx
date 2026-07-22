import { PluginID } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Link, Stack, Typography, useTheme } from '@mui/material'
import { Box } from '@mui/system'
import { useActivatedPluginSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => ({
    provider: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        '& > a': {
            lineHeight: 0,
        },
    },

    providerBy: {
        color: theme.vars.palette.text.secondary,
        ...theme.applyStyles('dark', {
            color: theme.vars.palette.grey[700],
        }),
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    publisher: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    wrapper: {
        padding: theme.spacing(2),
    },
}))

export function PluginHeader() {
    const theme = useTheme()
    const { classes } = useStyles()

    const plugin = useActivatedPluginSiteAdaptor(PluginID.RSS3, 'any')
    const publisher = plugin?.publisher

    return (
        <Stack
            className={classes.wrapper}
            sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', gap: 0.5, alignItems: 'center' }}>
                <Icons.DecentralizedSearch size={24} />
                <Typography sx={{ color: theme.vars.palette.maskColor.dark, fontWeight: 'bolder' }}>
                    <Trans>DSearch</Trans>
                </Typography>
            </Stack>
            <Box className={classes.provider}>
                {publisher ?
                    <Typography variant="body1" sx={{ fontSize: 14, fontWeight: '700' }} className={classes.providerBy}>
                        <Trans>
                            Powered by{' '}
                            <Typography
                                className={classes.publisher}
                                variant="body1"
                                sx={{
                                    color: theme.vars.palette.maskColor.textPluginColor,
                                    fontSize: 14,
                                    fontWeight: '700',
                                }}
                                component="span">
                                Mask Network
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://mask.io"
                                    sx={{ fontSize: 0 }}
                                    color={theme.vars.palette.maskColor.textPluginColor}>
                                    <Icons.LinkOut size={20} />
                                </Link>
                            </Typography>
                        </Trans>
                    </Typography>
                :   null}
            </Box>
        </Stack>
    )
}
