import { PluginID } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Stack, Typography, useTheme, Link } from '@mui/material'
import { useSharedTrans } from '@masknet/shared'
import { Box } from '@mui/system'
import { PluginTransFieldRender } from '@masknet/plugin-infra/content-script'
import { base } from '../base.js'

const useStyles = makeStyles()((theme, props) => {
    return {
        provider: {
            display: 'flex',
            alignItems: 'center',
            '& > a': {
                lineHeight: 0,
            },
        },

        providerBy: {
            marginRight: theme.spacing(0.5),
            color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.text.secondary,
        },

        wrapper: {
            padding: theme.spacing(2),
        },
    }
})

export function PluginHeader() {
    const t = useSharedTrans()
    const theme = useTheme()
    const { classes } = useStyles()

    return (
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" className={classes.wrapper}>
            <Stack flexDirection="row" justifyContent="space-between" gap={0.5} alignItems="center">
                <Icons.DecentralizedSearch size={24} />
                <Typography color={theme.palette.maskColor.dark} fontWeight="bolder">
                    {t.decentralized_search_name()}
                </Typography>
            </Stack>
            <Box className={classes.provider}>
                <Typography variant="body1" fontSize={14} fontWeight="400" className={classes.providerBy}>
                    {t.plugin_provider_by()}
                </Typography>
                {base.publisher ?
                    <Typography
                        variant="body1"
                        fontSize={14}
                        fontWeight="500"
                        component="div"
                        color={MaskColorVar.textPluginColor}>
                        <PluginTransFieldRender pluginID={PluginID.Handle} field={base.publisher.name} />
                    </Typography>
                :   null}
                {base.publisher?.link ?
                    <Link href={base.publisher.link} underline="none" target="_blank" rel="noopener">
                        <Icons.Provider size={18} style={{ marginLeft: 4 }} />
                    </Link>
                :   null}
            </Box>
        </Stack>
    )
}
