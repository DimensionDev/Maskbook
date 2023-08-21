// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import urlcat from 'urlcat'
import { Icons } from '@masknet/icons'
import {
    type EnhanceableSite,
    type ProfileAccount,
    PopupModalRoutes,
    PopupRoutes,
    currentMaskWalletLockStatusSettings,
    LockStatus,
} from '@masknet/shared-base'
import { MaskTabList, makeStyles } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { Box, Tab, Typography, useTheme } from '@mui/material'
import { memo, useCallback } from 'react'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { SocialAccounts } from '../../../components/SocialAccounts/index.js'
import { ConnectedWallet } from '../../../components/ConnectedWallet/index.js'
import type { ConnectedWalletInfo } from '../type.js'
import { useModalNavigate } from '../../../components/index.js'
import { PersonaPublicKey } from '../../../components/PersonaPublicKey/index.js'
import { PersonaAvatar } from '../../../components/PersonaAvatar/index.js'
import { useParamTab } from '../../../hook/useParamTab.js'
import { useNavigate } from 'react-router-dom'
import { PopupHomeTabType } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: {
        flex: 1,
        background: theme.palette.maskColor.bottom,
        display: 'flex',
        flexDirection: 'column',
    },
    info: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
    },
    content: {
        padding: 16,
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    titleWrapper: {
        padding: 16,
        display: 'flex',
        marginBottom: 12,
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        lineHeight: '120%',
        fontStyle: 'normal',
        fontWeight: 700,
    },
    addPersonaWrapper: {
        display: 'flex',
        width: 368,
        padding: 12,
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
        background: theme.palette.maskColor.bottom,
        borderRadius: 8,
        cursor: 'pointer',
    },
    subTitle: {
        color: theme.palette.maskColor.main,
        fontSize: 12,
        fontWeight: 700,
    },
    description: {
        color: theme.palette.maskColor.third,
        fontSize: 12,
        fontWeight: 400,
    },
    placeholderDescription: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        color: theme.palette.maskColor.third,
        marginTop: theme.spacing(1.5),
        textAlign: 'center',
    },
    edit: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        background: theme.palette.maskColor.bottom,
        borderRadius: 99,
        width: 18,
        height: 18,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
    publicKey: {
        fontSize: 12,
        color: theme.palette.maskColor.second,
    },
    icon: {
        color: theme.palette.maskColor.second,
    },
    settings: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    header: {
        padding: theme.spacing(2),
        lineHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.maskColor.line}`,
    },
    logo: {
        width: 100,
        height: 28,
    },
    menu: {
        color: theme.palette.maskColor.main,
    },
    tabs: {
        paddingLeft: 16,
        paddingRight: 16,
    },
    panel: {
        padding: theme.spacing(2),
        background: theme.palette.maskColor.bottom,
        flex: 1,
        maxHeight: 288,
        overflow: 'auto',
    },
    mnemonicIcon: {
        background: theme.palette.maskColor.success,
    },
    personaIcon: {
        background: theme.palette.maskColor.primary,
    },
    iconWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 30,
        height: 30,
        minWidth: 30,
        borderRadius: '100%',
    },
    emptyHeader: {
        height: 140,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.maskColor.modalTitleBg,
    },
}))

export interface PersonaHomeUIProps {
    hasProofs?: boolean
    avatar?: string | null
    fingerprint?: string
    publicKey?: string
    nickname?: string
    onCreatePersona: () => void
    onRestore: () => void
    isEmpty?: boolean
    accounts: ProfileAccount[]
    networks: EnhanceableSite[]
    onConnect: (networkIdentifier: EnhanceableSite) => void
    onAccountClick: (account: ProfileAccount) => void
    bindingWallets?: ConnectedWalletInfo[]
    hasPaymentPassword?: boolean
}

export const PersonaHomeUI = memo<PersonaHomeUIProps>(
    ({
        avatar,
        fingerprint,
        nickname,
        onCreatePersona,
        onRestore,
        isEmpty,
        accounts,
        networks,
        onConnect,
        publicKey,
        onAccountClick,
        bindingWallets,
        hasProofs,
        hasPaymentPassword,
    }) => {
        const theme = useTheme()
        const { t } = useI18N()
        const navigate = useNavigate()
        const modalNavigate = useModalNavigate()
        const { classes, cx } = useStyles()

        const [currentTab, onChange] = useParamTab<PopupHomeTabType>(PopupHomeTabType.SocialAccounts)

        const onChangeTab = useCallback(
            (event: object, value: PopupHomeTabType) => {
                if (
                    currentMaskWalletLockStatusSettings.value === LockStatus.LOCKED &&
                    value === PopupHomeTabType.ConnectedWallets &&
                    hasPaymentPassword
                ) {
                    navigate(urlcat(PopupRoutes.Unlock, { from: PopupRoutes.Personas, goBack: true, popup: true }))
                    return
                }
                onChange(event, value)
            },
            [hasPaymentPassword],
        )
        return (
            <div className={classes.container}>
                {!isEmpty ? (
                    <TabContext value={currentTab}>
                        <Box sx={{ background: theme.palette.maskColor.modalTitleBg }}>
                            <Box className={classes.header}>
                                <Icons.MaskSquare className={classes.logo} />
                                <Icons.HamburgerMenu
                                    className={classes.menu}
                                    onClick={() => modalNavigate(PopupModalRoutes.SwitchPersona)}
                                />
                            </Box>
                            <Box className={classes.info}>
                                <Box position="relative" height="60px">
                                    <PersonaAvatar size={60} avatar={avatar} hasProofs={hasProofs} />
                                    <Box
                                        className={classes.edit}
                                        onClick={() => navigate(PopupRoutes.PersonaAvatarSetting)}>
                                        <Icons.Edit size={12} />
                                    </Box>
                                </Box>
                                <Typography fontSize={18} fontWeight="700" lineHeight="22px" marginTop="8px">
                                    {nickname}
                                </Typography>
                                {fingerprint && publicKey ? (
                                    <PersonaPublicKey
                                        classes={{ text: classes.publicKey, icon: classes.icon }}
                                        rawPublicKey={fingerprint}
                                        publicHexString={publicKey}
                                        iconSize={12}
                                    />
                                ) : null}
                                <Icons.Settings2
                                    size={20}
                                    className={classes.settings}
                                    onClick={() => modalNavigate(PopupModalRoutes.PersonaSettings)}
                                />
                            </Box>

                            <MaskTabList
                                onChange={onChangeTab}
                                aria-label="persona-tabs"
                                classes={{ root: classes.tabs }}>
                                <Tab label={t('popups_social_account')} value={PopupHomeTabType.SocialAccounts} />
                                <Tab label={t('popups_connected_wallets')} value={PopupHomeTabType.ConnectedWallets} />
                            </MaskTabList>
                        </Box>
                        <TabPanel className={classes.panel} value={PopupHomeTabType.SocialAccounts} data-hide-scrollbar>
                            <SocialAccounts
                                accounts={accounts}
                                networks={networks}
                                onConnect={onConnect}
                                onAccountClick={onAccountClick}
                            />
                        </TabPanel>
                        <TabPanel
                            className={classes.panel}
                            value={PopupHomeTabType.ConnectedWallets}
                            data-hide-scrollbar>
                            <ConnectedWallet wallets={bindingWallets} />
                        </TabPanel>
                    </TabContext>
                ) : (
                    <Box className={classes.container} data-hide-scrollbar>
                        <Box className={classes.emptyHeader}>
                            <Icons.MaskSquare width={160} height={46} />
                        </Box>
                        <Box className={classes.content}>
                            <Box className={classes.titleWrapper}>
                                <Typography className={classes.title}>{t('welcome_to_mask')}</Typography>
                                <Typography className={classes.placeholderDescription}>
                                    {t('popups_add_persona_description')}
                                </Typography>
                            </Box>
                            <Box className={classes.addPersonaWrapper} onClick={onCreatePersona}>
                                <div className={cx(classes.iconWrapper, classes.personaIcon)}>
                                    <Icons.AddUser size={20} color={theme.palette.maskColor.white} />
                                </div>
                                <div>
                                    <Typography className={classes.subTitle}>{t('popups_create_persona')}</Typography>
                                    <Typography className={classes.description}>
                                        {t('popups_generate_a_new_persona')}
                                    </Typography>
                                </div>
                            </Box>

                            <Box className={classes.addPersonaWrapper} onClick={onRestore}>
                                <div className={cx(classes.iconWrapper, classes.mnemonicIcon)}>
                                    <Icons.PopupRestore size={20} color={theme.palette.maskColor.white} />
                                </div>
                                <div>
                                    <Typography className={classes.subTitle}>
                                        {t('popups_restore_and_login')}
                                    </Typography>
                                    <Typography className={classes.description}>
                                        {t('popups_import_persona_description')}
                                    </Typography>
                                </div>
                            </Box>
                        </Box>
                    </Box>
                )}
            </div>
        )
    },
)
