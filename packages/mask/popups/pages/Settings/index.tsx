import Services from '#services'
import { env } from '@masknet/flags'
import { Icons } from '@masknet/icons'
import { Appearance, LanguageOptions } from '@masknet/public-api'
import { DashboardRoutes, PopupModalRoutes, Sniffings } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { Box, List, ListItem, ListItemText, Typography, useTheme } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { Trans, msg } from '@lingui/macro'
import {
    UserContext,
    useAppearance,
    useLanguage,
    useMaskSharedTrans,
    MaskSharedTrans,
} from '../../../shared-ui/index.js'
import { NormalHeader, useModalNavigate } from '../../components/index.js'
import { useSupportedSites } from '../../hooks/useSupportedSites.js'
import { useTitle } from '../../hooks/useTitle.js'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
        flex: 1,
        paddingBottom: 80,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(2),
    },
    header: {
        display: 'flex',
        columnGap: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5),
    },
    headerContent: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    headerIcon: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: theme.palette.maskColor.white,
        padding: theme.spacing(1.25),
        borderRadius: 10,
        background: theme.palette.maskColor.primary,
    },
    title: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    titleDescription: {
        fontSize: 14,
        lineHeight: '20px',
        color: theme.palette.maskColor.third,
    },
    list: {
        borderRadius: 16,
        background: theme.palette.maskColor.bottom,
        boxShadow: theme.palette.maskColor.bottomBg,
        backdropFilter: 'blur(8px)',
        padding: theme.spacing(2),
    },
    listItem: {
        cursor: 'pointer',
        padding: theme.spacing(1.5, 0),
        borderBottom: `1px solid ${theme.palette.maskColor.line}`,
        '&:first-of-type': {
            paddingTop: 0,
        },
        '&:last-of-type': {
            paddingBottom: 0,
            borderBottom: 'none',
        },
        '&:hover > span': {
            color: theme.palette.maskColor.main,
        },
    },
    listItemText: {
        margin: 0,
    },
    listItemPrimaryText: {
        color: theme.palette.maskColor.third,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
    },
    listItemSecondaryText: {
        color: theme.palette.maskColor.main,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
    },
    arrow: {
        color: theme.palette.maskColor.second,
    },
}))

const FEEDBACK_MAIL = 'Support@mask.io'
const FAQ_LINK =
    'realmasknetwork.notion.site/realmasknetwork/Mask-Network-2-0-Setting-Up-Features-The-Broader-Ecosystem-e4b3e24182e045a58bdb5549c0daea82'
const HOME_LINK = 'Mask.io'

export const Component = memo(function SettingsPage() {
    const { _ } = useLingui()
    const theme = useTheme()
    const t = useMaskSharedTrans()
    const { classes } = useStyles()
    const modalNavigate = useModalNavigate()

    const lang = useLanguage()
    const mode = useAppearance()

    const { user } = UserContext.useContainer()

    const LANGUAGE_OPTIONS_MAP = useMemo(
        () => ({
            [LanguageOptions.__auto__]: <Trans>Follow System</Trans>,
            [LanguageOptions.enUS]: 'English',
            [LanguageOptions.zhCN]: '简体中文',
            [LanguageOptions.zhTW]: '繁体中文',
            [LanguageOptions.jaJP]: '日本語',
            [LanguageOptions.koKR]: '한국인',
        }),
        [t],
    )

    const APPEARANCE_OPTIONS_MAP = useMemo(
        () => ({
            [Appearance.default]: <Trans>Follow System</Trans>,
            [Appearance.light]: <Trans>Light</Trans>,
            [Appearance.dark]: <Trans>Dark</Trans>,
        }),
        [t],
    )

    const itemClasses = useMemo(
        () => ({
            root: classes.listItemText,
            primary: classes.listItemPrimaryText,
            secondary: classes.listItemSecondaryText,
        }),
        [classes],
    )

    const localBackupTip = (() => {
        if (!user.backupPassword) return <Trans>Please set the backup password to back up</Trans>
        if (!user.localBackupAt) return <Trans>No back up</Trans>
        return <Trans>Backup on {user.localBackupAt}</Trans>
    })()

    const cloudBackupTip = (() => {
        if (!user.backupPassword) return <Trans>Please set the backup password to back up</Trans>
        if (!user.cloudBackupAt) return <Trans>No back up</Trans>
        return <Trans>Backup on {user.cloudBackupAt}</Trans>
    })()

    const { data } = useSupportedSites()

    const handleOpenDashboard = useCallback(async (route: DashboardRoutes) => {
        await browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(`/dashboard.html#${route}`),
        })
        if (Sniffings.is_firefox) {
            window.close()
        }
        await Services.Helper.removePopupWindow()
    }, [])

    useTitle(_(msg`Settings`))

    return (
        <>
            <NormalHeader />
            <Box className={classes.container} data-hide-scrollbar>
                <Box>
                    <Box className={classes.header}>
                        <Box className={classes.headerIcon}>
                            <Icons.Filter size={24} />
                        </Box>
                        <Box className={classes.headerContent}>
                            <Typography className={classes.title}>
                                <Trans>General</Trans>
                            </Typography>
                            <Typography className={classes.titleDescription}>
                                <Trans>Basic setting</Trans>
                            </Typography>
                        </Box>
                    </Box>
                    <List className={classes.list}>
                        <ListItem
                            className={classes.listItem}
                            onClick={() => modalNavigate(PopupModalRoutes.SelectLanguage)}>
                            <ListItemText
                                classes={itemClasses}
                                primary={<Trans>Language</Trans>}
                                secondary={LANGUAGE_OPTIONS_MAP[lang]}
                            />
                            <Icons.ArrowRight size={24} className={classes.arrow} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() => modalNavigate(PopupModalRoutes.SelectAppearance)}>
                            <ListItemText
                                classes={itemClasses}
                                primary={<Trans>Appearance</Trans>}
                                secondary={APPEARANCE_OPTIONS_MAP[mode]}
                            />
                            <Icons.ArrowRight size={24} className={classes.arrow} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() => modalNavigate(PopupModalRoutes.SupportedSitesModal)}>
                            <ListItemText
                                classes={itemClasses}
                                primary={<Trans>Supported Sites</Trans>}
                                secondary={
                                    // eslint-disable-next-line react/naming-convention/component-name
                                    <MaskSharedTrans.popups_settings_supported_website
                                        components={{
                                            strong: <span style={{ color: theme.palette.maskColor.main }} />,
                                        }}
                                        values={{
                                            count: data?.filter((x) => x.allowInject && x.hasPermission).length || '',
                                        }}
                                    />
                                }
                            />
                            <Icons.ArrowRight size={24} className={classes.arrow} />
                        </ListItem>
                    </List>
                </Box>
                <Box>
                    <Box className={classes.header}>
                        <Box className={classes.headerIcon}>
                            <Icons.History size={24} />
                        </Box>
                        <Box className={classes.headerContent}>
                            <Typography className={classes.title}>
                                <Trans>Backup & Recovery</Trans>
                            </Typography>
                            <Typography className={classes.titleDescription}>
                                <Trans>Data correlation</Trans>
                            </Typography>
                        </Box>
                    </Box>
                    <List className={classes.list}>
                        <ListItem
                            className={classes.listItem}
                            onClick={() => {
                                if (!user.backupPassword) {
                                    modalNavigate(PopupModalRoutes.SetBackupPassword)
                                } else {
                                    handleOpenDashboard(DashboardRoutes.CloudBackup)
                                }
                            }}>
                            <ListItemText
                                classes={itemClasses}
                                primary={<Trans>Cloud Backup</Trans>}
                                secondary={cloudBackupTip}
                            />
                            <Icons.ArrowRight size={24} className={classes.arrow} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() => {
                                if (!user.backupPassword) {
                                    modalNavigate(PopupModalRoutes.SetBackupPassword)
                                } else {
                                    handleOpenDashboard(DashboardRoutes.LocalBackup)
                                }
                            }}>
                            <ListItemText
                                classes={itemClasses}
                                primary={<Trans>Local Backup</Trans>}
                                secondary={localBackupTip}
                            />
                            <Icons.ArrowRight size={24} className={classes.arrow} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() => handleOpenDashboard(DashboardRoutes.RecoveryPersona)}>
                            <ListItemText
                                classes={itemClasses}
                                primary={<Trans>Restore Database</Trans>}
                                secondary={<Trans>Restore from a previous database backup</Trans>}
                            />
                            <Icons.ArrowRight size={24} className={classes.arrow} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() =>
                                modalNavigate(
                                    user.backupPassword ?
                                        PopupModalRoutes.ChangeBackupPassword
                                    :   PopupModalRoutes.SetBackupPassword,
                                )
                            }>
                            <ListItemText
                                classes={itemClasses}
                                primary={<Trans>Backup Password</Trans>}
                                secondary={
                                    user.backupPassword ? <Trans>Change Backup Password</Trans> : <Trans>Not set</Trans>
                                }
                            />
                            <Icons.ArrowRight size={24} className={classes.arrow} />
                        </ListItem>
                    </List>
                </Box>
                <Box>
                    <Box className={classes.header}>
                        <Box className={classes.headerIcon}>
                            <Icons.Questions size={24} />
                        </Box>
                        <Box className={classes.headerContent}>
                            <Typography className={classes.title}>
                                <Trans>Support</Trans>
                            </Typography>
                            <Typography className={classes.titleDescription}>
                                <Trans>Basic setting</Trans>
                            </Typography>
                        </Box>
                    </Box>
                    <List className={classes.list}>
                        <ListItem className={classes.listItem} onClick={() => openWindow(`mailto:${FEEDBACK_MAIL}`)}>
                            <ListItemText
                                classes={itemClasses}
                                primary={<Trans>Feedback</Trans>}
                                secondary={FEEDBACK_MAIL}
                            />
                            <Icons.ArrowRight size={24} className={classes.arrow} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() => openWindow(`https://${FAQ_LINK}`, '_blank', { referrer: false })}>
                            <ListItemText
                                classes={itemClasses}
                                primary={<Trans>FAQ&Tutorial</Trans>}
                                secondary={'realmasknetwork.notion.site'}
                            />
                            <Icons.ArrowRight size={24} className={classes.arrow} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() => openWindow(`https://${HOME_LINK}`, '_blank', { referrer: false })}>
                            <ListItemText
                                classes={itemClasses}
                                primary={<Trans>Website</Trans>}
                                secondary={HOME_LINK}
                            />
                            <Icons.ArrowRight size={24} className={classes.arrow} />
                        </ListItem>
                    </List>
                </Box>
                <Box>
                    <Box className={classes.header}>
                        <Box className={classes.headerIcon}>
                            <Icons.Appearance size={24} />
                        </Box>
                        <Box className={classes.headerContent}>
                            <Typography className={classes.title}>
                                <Trans>About</Trans>
                            </Typography>
                        </Box>
                    </Box>
                    <List className={classes.list}>
                        <ListItem
                            className={classes.listItem}
                            onClick={() =>
                                openWindow('https://github.com/DimensionDev/Maskbook', '_blank', { referrer: false })
                            }>
                            <ListItemText
                                classes={itemClasses}
                                primary={<Trans>Version</Trans>}
                                secondary={env.VERSION}
                            />
                            <Icons.ArrowRight size={24} className={classes.arrow} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() =>
                                openWindow(
                                    'https://legal.mask.io/maskbook/service-agreement-beta-browser.html',
                                    '_blank',
                                    { referrer: false },
                                )
                            }>
                            <ListItemText classes={itemClasses} secondary={<Trans>Service Agreement</Trans>} />
                            <Icons.ArrowRight size={24} className={classes.arrow} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() =>
                                openWindow('https://legal.mask.io/maskbook/privacy-policy-browser.html', '_blank', {
                                    referrer: false,
                                })
                            }>
                            <ListItemText classes={itemClasses} secondary={<Trans>Privacy Policy</Trans>} />
                            <Icons.ArrowRight size={24} className={classes.arrow} />
                        </ListItem>
                    </List>
                </Box>
            </Box>
        </>
    )
})
