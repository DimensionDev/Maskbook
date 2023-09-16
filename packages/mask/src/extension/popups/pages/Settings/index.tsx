import { Box, List, ListItem, ListItemText, Typography, useTheme } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { useTitle } from '../../hooks/useTitle.js'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { NormalHeader, useModalNavigate } from '../../components/index.js'
import { env } from '@masknet/flags'
import { UserContext, useAppearance, useLanguage } from '../../../../../shared-ui/index.js'
import { Appearance, LanguageOptions } from '@masknet/public-api'
import { openWindow } from '@masknet/shared-base-ui'
import { DashboardRoutes, PopupModalRoutes } from '@masknet/shared-base'
import { useSupportedSites } from '../../hooks/useSupportedSites.js'
import { Trans } from 'react-i18next'
import Services from '#services'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
        flex: 1,
        maxHeight: 474,
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
        '&:first-child': {
            paddingTop: 0,
        },
        '&:last-child': {
            paddingBottom: 0,
            borderBottom: 'none',
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
}))

const FEEDBACK_MAIL = 'Support@mask.io'
const FAQ_LINK = 'realmasknetwork.notion.site'
const HOME_LINK = 'Mask.io'

const Settings = memo(function Settings() {
    const theme = useTheme()
    const { t } = useI18N()
    const { classes } = useStyles()
    const modalNavigate = useModalNavigate()

    const lang = useLanguage()
    const mode = useAppearance()

    const { user } = UserContext.useContainer()

    const LANGUAGE_OPTIONS_MAP = useMemo(
        () => ({
            [LanguageOptions.__auto__]: t('popups_settings_language_auto'),
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
            [Appearance.default]: t('popups_settings_appearance_default'),
            [Appearance.light]: t('popups_settings_appearance_light'),
            [Appearance.dark]: t('popups_settings_appearance_dark'),
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

    const localBackupTip = useMemo(() => {
        if (!user.backupPassword) return t('popups_settings_set_backup_password_tips')
        const backupMethod = localStorage.getItem('backupMethod')
        // old data
        if (backupMethod === 'local' && !user.localBackupAt) return t('popups_settings_local_backup_exist')
        if (!user.localBackupAt) return t('popups_settings_no_backup')
        return t('popups_settings_backup_on', { time: user.localBackupAt })
    }, [user])

    const cloudBackupTip = useMemo(() => {
        if (!user.backupPassword) return t('popups_settings_set_backup_password_tips')
        const backupMethod = localStorage.getItem('backupMethod')
        // old data
        if (backupMethod === 'cloud' && !user.cloudBackupAt) return t('popups_settings_cloud_backup_exist')
        if (!user.cloudBackupAt) return t('popups_settings_no_backup')
        return t('popups_settings_backup_on', { time: user.cloudBackupAt })
    }, [user])

    const { data } = useSupportedSites()

    const handleOpenDashboard = useCallback(async (route: DashboardRoutes) => {
        await browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(`/dashboard.html#${route}`),
        })
        if (navigator.userAgent.includes('Firefox')) {
            window.close()
        }
        await Services.Helper.removePopupWindow()
    }, [])

    useTitle(t('settings'))

    return (
        <>
            <NormalHeader />
            <Box className={classes.container}>
                <Box>
                    <Box className={classes.header}>
                        <Box className={classes.headerIcon}>
                            <Icons.Filter size={24} />
                        </Box>
                        <Box className={classes.headerContent}>
                            <Typography className={classes.title}>{t('popups_settings_general')}</Typography>
                            <Typography className={classes.titleDescription}>
                                {t('popups_settings_basic_setting')}
                            </Typography>
                        </Box>
                    </Box>
                    <List className={classes.list}>
                        <ListItem
                            className={classes.listItem}
                            onClick={() => modalNavigate(PopupModalRoutes.SelectLanguage)}>
                            <ListItemText
                                classes={itemClasses}
                                primary={t('popups_settings_language')}
                                secondary={LANGUAGE_OPTIONS_MAP[lang]}
                            />
                            <Icons.ArrowRight size={24} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() => modalNavigate(PopupModalRoutes.SelectAppearance)}>
                            <ListItemText
                                classes={itemClasses}
                                primary={t('popups_settings_appearance')}
                                secondary={APPEARANCE_OPTIONS_MAP[mode]}
                            />
                            <Icons.ArrowRight size={24} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() => modalNavigate(PopupModalRoutes.SupportedSitesModal)}>
                            <ListItemText
                                classes={itemClasses}
                                primary={t('popups_settings_supported_sites')}
                                secondary={
                                    <Trans
                                        i18nKey="popups_settings_supported_website"
                                        components={{
                                            strong: <span style={{ color: theme.palette.maskColor.main }} />,
                                        }}
                                        values={{ count: data?.filter((x) => x.allowInject && x.hasPermission).length }}
                                    />
                                }
                            />
                            <Icons.ArrowRight size={24} />
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
                                {t('popups_settings_backup_and_recovery')}
                            </Typography>
                            <Typography className={classes.titleDescription}>
                                {t('popups_settings_data_correlation')}
                            </Typography>
                        </Box>
                    </Box>
                    <List className={classes.list}>
                        <ListItem className={classes.listItem}>
                            <ListItemText
                                classes={itemClasses}
                                primary={t('popups_settings_cloud_backup')}
                                secondary={cloudBackupTip}
                                onClick={() => {
                                    if (!user.backupPassword) {
                                        modalNavigate(PopupModalRoutes.SetBackupPassword)
                                    } else {
                                        handleOpenDashboard(DashboardRoutes.CloudBackup)
                                    }
                                }}
                            />
                            <Icons.ArrowRight size={24} />
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
                                primary={t('popups_settings_local_backup')}
                                secondary={localBackupTip}
                            />
                            <Icons.ArrowRight size={24} />
                        </ListItem>
                        <ListItem className={classes.listItem}>
                            <ListItemText
                                classes={itemClasses}
                                primary={t('popups_settings_restore_database')}
                                secondary={t('popups_settings_restore_database_description')}
                            />
                            <Icons.ArrowRight size={24} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() =>
                                modalNavigate(
                                    user.backupPassword
                                        ? PopupModalRoutes.ChangeBackupPassword
                                        : PopupModalRoutes.SetBackupPassword,
                                )
                            }>
                            <ListItemText
                                classes={itemClasses}
                                primary={t('popups_settings_backup_password')}
                                secondary={
                                    user.backupPassword
                                        ? t('popups_settings_change_backup_password')
                                        : t('popups_settings_not_set')
                                }
                            />
                            <Icons.ArrowRight size={24} />
                        </ListItem>
                    </List>
                </Box>
                <Box>
                    <Box className={classes.header}>
                        <Box className={classes.headerIcon}>
                            <Icons.Questions size={24} />
                        </Box>
                        <Box className={classes.headerContent}>
                            <Typography className={classes.title}>{t('popups_settings_support')}</Typography>
                            <Typography className={classes.titleDescription}>
                                {t('popups_settings_basic_setting')}
                            </Typography>
                        </Box>
                    </Box>
                    <List className={classes.list}>
                        <ListItem className={classes.listItem} onClick={() => openWindow(`mailto:${FEEDBACK_MAIL}`)}>
                            <ListItemText
                                classes={itemClasses}
                                primary={t('popups_settings_feedback')}
                                secondary={FEEDBACK_MAIL}
                            />
                            <Icons.ArrowRight size={24} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() => openWindow(`https://${FAQ_LINK}`, '_blank', { referrer: false })}>
                            <ListItemText
                                classes={itemClasses}
                                primary={t('popups_settings_faq')}
                                secondary={FAQ_LINK}
                            />
                            <Icons.ArrowRight size={24} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() => openWindow(`https://${HOME_LINK}`, '_blank', { referrer: false })}>
                            <ListItemText
                                classes={itemClasses}
                                primary={t('popups_settings_website')}
                                secondary={HOME_LINK}
                            />
                            <Icons.ArrowRight size={24} />
                        </ListItem>
                    </List>
                </Box>
                <Box>
                    <Box className={classes.header}>
                        <Box className={classes.headerIcon}>
                            <Icons.Appearance size={24} />
                        </Box>
                        <Box className={classes.headerContent}>
                            <Typography className={classes.title}>{t('popups_settings_about')}</Typography>
                        </Box>
                    </Box>
                    <List className={classes.list}>
                        <ListItem className={classes.listItem}>
                            <ListItemText
                                classes={itemClasses}
                                primary={t('popups_settings_version')}
                                secondary={env.VERSION}
                            />
                            <Icons.ArrowRight size={24} />
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
                            <ListItemText classes={itemClasses} secondary={t('popups_settings_service_agreement')} />
                            <Icons.ArrowRight size={24} />
                        </ListItem>
                        <ListItem
                            className={classes.listItem}
                            onClick={() =>
                                openWindow('https://legal.mask.io/maskbook/privacy-policy-browser.html', '_blank', {
                                    referrer: false,
                                })
                            }>
                            <ListItemText classes={itemClasses} secondary={t('popups_settings_primary_policy')} />
                            <Icons.ArrowRight size={24} />
                        </ListItem>
                    </List>
                </Box>
            </Box>
        </>
    )
})

export default Settings
