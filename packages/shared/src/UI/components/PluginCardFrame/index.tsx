import { makeStyles } from '@masknet/theme'
import { Link, Stack, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useMemo } from 'react'
import { useSharedI18N } from '../../../locales/index.js'
import { LoadingStatus } from '../index.js'

const useStyles = makeStyles()((theme) => ({
    title: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(45, 41, 253, 0.2) 100%), #FFFFFF;',
        minHeight: '196px',
        justifyContent: 'space-between',
    },
    web3Icon: {
        marginRight: 6,
        marginTop: 2,
    },
    item1: {
        color: theme.palette.maskColor.secondaryDark,
        fontSize: '14px',
        fontWeight: 400,
    },
    item2: {
        color: theme.palette.maskColor.dark,
        fontSize: '14px',
        fontWeight: 500,
        marginLeft: '2px',
    },
    linkOutIcon: {
        color: theme.palette.maskColor.secondaryDark,
    },
}))

export interface PluginCardFrameMiniProps {
    name?: React.ReactNode
    provider?: React.ReactNode
    providerLink?: string
    children?: React.ReactNode
}

export function PluginCardFrameMini({ name, provider, providerLink, children }: PluginCardFrameMiniProps) {
    const t = useSharedI18N()
    const { classes } = useStyles()

    const defaultPluginName = useMemo(() => {
        return (
            <Stack className={classes.title} direction="row">
                <Icons.Web3Profile className={classes.web3Icon} />
                <Typography fontSize={16} fontWeight={700}>
                    {t.plugin_card_frame_default_title()}
                </Typography>
            </Stack>
        )
    }, [])

    return (
        <Stack className={classes.container}>
            <Stack direction="row" justifyContent="space-between" p={1.5}>
                {name ?? defaultPluginName}
                <Stack direction="row" gap={0.5}>
                    <Typography className={classes.item1}>{t.plugin_card_frame_default_provided_by()}</Typography>
                    <Typography className={classes.item2}>
                        {provider ?? t.plugin_card_frame_default_provided_by_value()}
                    </Typography>
                    <Link
                        underline="none"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="textPrimary"
                        href={providerLink ?? 'https://mask.io/'}
                        width="22px"
                        height="22px"
                        style={{ alignSelf: 'center', marginLeft: '4px' }}>
                        <Icons.LinkOut size={16} className={classes.linkOutIcon} />
                    </Link>
                </Stack>
            </Stack>
            <Stack flex={1} justifyContent="center" alignItems="center" p={1.5}>
                {children ?? <LoadingStatus iconSize={24}>{t.plugin_card_frame_loading()}</LoadingStatus>}
            </Stack>
        </Stack>
    )
}
