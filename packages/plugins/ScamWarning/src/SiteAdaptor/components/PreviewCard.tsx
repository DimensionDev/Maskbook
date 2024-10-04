import { useAsync } from 'react-use'
import { uniq } from 'lodash-es'
import { Stack, ThemeProvider, Typography } from '@mui/material'
import { CryptoScamDB } from '@masknet/web3-providers'
import { usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { makeStyles, MaskDarkTheme } from '@masknet/theme'
import { Plural } from '@lingui/macro'

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
                        <Plural
                            value={value.length}
                            one="This domain is currently on the Mask Network warning list which may include malicious entries, phishing or scams."
                            other="These domains are currently on the Mask Network warning list which may include malicious entries, phishing or scams."
                        />
                    </Typography>
                </Stack>
            </Stack>
        </ThemeProvider>
    )
}
