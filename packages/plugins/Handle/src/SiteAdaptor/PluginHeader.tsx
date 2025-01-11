import { PluginID } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { makeStyles, MaskColorVar } from '@masknet/theme'
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
        color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.text.secondary,
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
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" className={classes.wrapper}>
            <Stack flexDirection="row" justifyContent="space-between" gap={0.5} alignItems="center">
                <Icons.DecentralizedSearch size={24} />
                <Typography color={theme.palette.maskColor.dark} fontWeight="bolder">
                    <Trans>DSearch</Trans>
                </Typography>
            </Stack>
            <Box className={classes.provider}>
                {publisher ?
                    <Typography variant="body1" fontSize={14} fontWeight="700" className={classes.providerBy}>
                        <Trans>
                            Powered by{' '}
                            <Typography
                                className={classes.publisher}
                                variant="body1"
                                fontSize={14}
                                fontWeight="700"
                                component="span"
                                color={MaskColorVar.textPluginColor}>
                                Mask Network
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://mask.io"
                                    fontSize={0}
                                    color={MaskColorVar.textPluginColor}>
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
