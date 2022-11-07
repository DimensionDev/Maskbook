import * as React from 'react'
import { Stack, Typography } from '@mui/material'
import { useAsync } from 'react-use'
import { CryptoscanDb } from '@masknet/web3-providers'
import { uniq } from 'lodash-es'
import { useI18N } from '../../locales/index.js'
import { makeStyles } from '@masknet/theme'

interface PreviewCardProps {
    links: string[]
}

const useStyles = makeStyles()((theme) => ({
    root: {},
    card: {
        padding: theme.spacing(1),
        color: theme.palette.maskColor.bottom,
        backgroundColor: theme.palette.maskColor.danger,
        borderRadius: theme.spacing(1),
    },
}))

const excludedLinks = ['t.co']

export const PreviewCard = ({ links }: PreviewCardProps) => {
    const t = useI18N()
    const { classes } = useStyles()
    const { value, loading } = useAsync(() => {
        const hosts = links.map((x) => new URL(x).host).filter((x) => !excludedLinks.includes(x))
        return CryptoscanDb.getScamWarnings(uniq(hosts))
    }, [links])

    const urls = value?.map((x) => x.url).join()

    return (
        <Stack p={1.5} pt={0} className={classes.root}>
            <Stack className={classes.card}>
                <Typography variant="h6" fontWeight={700} color="textPrimary">
                    {urls}
                </Typography>
                <Typography variant="body1" color="textPrimary">
                    {t.warning_description()}
                </Typography>
            </Stack>
        </Stack>
    )
}
