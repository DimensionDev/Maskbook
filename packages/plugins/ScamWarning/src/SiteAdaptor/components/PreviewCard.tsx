import { useAsync } from 'react-use'
import { uniq } from 'lodash-es'
import { Stack, ThemeProvider, Typography } from '@mui/material'
import { CryptoScamDB } from '@masknet/web3-providers'
import { usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { useI18N } from '../../locales/index.js'
import { makeStyles, MaskDarkTheme } from '@masknet/theme'

interface PreviewCardProps {
    links: readonly string[]
}

const useStyles = makeStyles()((theme) => ({
    root: {},
    card: {
        padding: theme.spacing(1),
        color: theme.palette.maskColor.bottom,
        backgroundColor: theme.palette.maskColor.danger,
        borderRadius: theme.spacing(1),
    },
    title: {
        wordBreak: 'break-word',
    },
}))

export function PreviewCard({ links }: PreviewCardProps) {
    const t = useI18N()
    const { classes } = useStyles()

    const { value, loading } = useAsync(() => {
        return CryptoScamDB.getScamWarnings(uniq(links))
    }, [links.join(',')])

    usePluginWrapper(!(loading || !value?.length))

    if (!value?.length || loading) return null

    return (
        <ThemeProvider theme={MaskDarkTheme}>
            <Stack p={1.5} pt={0} className={classes.root}>
                <Stack className={classes.card}>
                    {value.map((x) => (
                        <Typography
                            key={x.url}
                            className={classes.title}
                            variant="h6"
                            fontWeight={700}
                            color="textPrimary">
                            {x.url}
                        </Typography>
                    ))}
                    <Typography variant="body1" color="textPrimary">
                        {t.warning_description({ count: value.length })}
                    </Typography>
                </Stack>
            </Stack>
        </ThemeProvider>
    )
}
