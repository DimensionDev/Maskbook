import { makeStyles } from '@masknet/theme'
import { Link, Stack, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { LoadingStatus } from '../index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    title: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.maskColor.main,
    },
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(45, 41, 253, 0.2) 100%), #FFFFFF;',
        minHeight: '196px',
        justifyContent: 'space-between',
        color: theme.palette.maskColor.main,
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
    icon?: React.ReactNode
    title?: React.ReactNode
    provider?: React.ReactNode
    providerLink?: string
    children?: React.ReactNode
}

export function PluginCardFrameMini({ icon, title, provider, providerLink, children }: PluginCardFrameMiniProps) {
    const { classes, theme } = useStyles()

    const PluginName = (
        <Stack className={classes.title} direction="row">
            {icon ?? <Icons.Web3Profile className={classes.web3Icon} />}
            <Typography fontSize={16} fontWeight={700} color={theme.palette.maskColor.main}>
                {title ?? <Trans>Web3 Profile</Trans>}
            </Typography>
        </Stack>
    )

    return (
        <Stack className={classes.container}>
            <Stack direction="row" justifyContent="space-between" p={1.5}>
                {PluginName}
                <Stack direction="row" gap={0.5}>
                    <Trans>
                        <Typography className={classes.item1}>Powered by </Typography>
                        <Typography className={classes.item2}>{provider ?? 'Mask Network'}</Typography>
                    </Trans>
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
                {children ?? (
                    <LoadingStatus iconSize={24} color={theme.palette.maskColor.main}>
                        <Trans>Loading....</Trans>
                    </LoadingStatus>
                )}
            </Stack>
        </Stack>
    )
}
