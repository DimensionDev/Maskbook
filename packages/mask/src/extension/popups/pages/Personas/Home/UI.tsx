// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { memo } from 'react'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import urlcat from 'urlcat'
import { Avatar, Box, Button, Link, Tab, Typography, useTheme } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { type EnhanceableSite, formatPersonaFingerprint, type ProfileAccount } from '@masknet/shared-base'
import { CopyIconButton } from '../../../components/CopyIconButton/index.js'
import { TabContext, TabPanel } from '@mui/lab'
import { SocialAccounts } from '../../../components/SocialAccounts/index.js'
import { ConnectedWallet } from '../../../components/ConnectedWallet/index.js'
import type { ConnectedWalletInfo } from '../type.js'
import { useSearchParams } from 'react-router-dom'
import { HomeTabType } from '../../Wallet/type.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FA',
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
    controller: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 12,
        padding: '0 16px 16px 16px',
    },
    emptyHeader: {
        height: 140,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.maskColor.modalTitleBg,
    },
    placeholder: {
        textAlign: 'center',
        height: 233,
        padding: theme.spacing(2, 2, 0, 2),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    placeholderTitle: {
        fontSize: 24,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    placeholderDescription: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        color: theme.palette.maskColor.third,
        marginTop: theme.spacing(1.5),
    },
    edit: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        background: theme.palette.maskColor.bottom,
        borderRadius: 99,
        width: 18,
        height: 18,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 12,
        height: 12,
        fontSize: 12,
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
}))

export interface PersonaHomeUIProps {
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
    }) => {
        const theme = useTheme()
        const { t } = useI18N()
        const { classes } = useStyles()

        const [params] = useSearchParams()

        const [currentTab, onChange] = useTabs(
            params.get('tab') || HomeTabType.SocialAccounts,
            HomeTabType.SocialAccounts,
            HomeTabType.ConnectedWallets,
        )

        return (
            <div className={classes.container}>
                {!isEmpty ? (
                    <TabContext value={currentTab}>
                        <Box style={{ background: theme.palette.maskColor.modalTitleBg }}>
                            <Box className={classes.header}>
                                <Icons.MaskSquare className={classes.logo} />
                                <Icons.HamburgerMenu className={classes.menu} />
                            </Box>
                            <Box className={classes.info}>
                                <Box position="relative">
                                    {avatar ? (
                                        <Avatar src={avatar} style={{ width: 60, height: 60 }} />
                                    ) : (
                                        <Icons.MenuPersonasActive size={60} style={{ borderRadius: 99 }} />
                                    )}
                                    <Box className={classes.edit}>
                                        <Icons.Edit size={12} />
                                    </Box>
                                </Box>
                                <Typography fontSize={18} fontWeight="700" lineHeight="22px" marginTop="8px">
                                    {nickname}
                                </Typography>
                                {fingerprint ? (
                                    <Typography
                                        fontSize={12}
                                        color={theme.palette.maskColor.second}
                                        lineHeight="16px"
                                        display="flex"
                                        alignItems="center"
                                        columnGap="2px">
                                        {formatPersonaFingerprint(fingerprint, 4)}
                                        <CopyIconButton text={fingerprint} className={classes.icon} />
                                        <Link
                                            underline="none"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={urlcat('https://web3.bio/', { s: publicKey })}
                                            className={classes.icon}>
                                            <Icons.LinkOut size={12} />
                                        </Link>
                                    </Typography>
                                ) : null}
                                <Icons.Settings2 size={20} className={classes.settings} />
                            </Box>

                            <MaskTabList onChange={onChange} aria-label="persona-tabs" classes={{ root: classes.tabs }}>
                                <Tab label={t('popups_social_account')} value={HomeTabType.SocialAccounts} />
                                <Tab label={t('popups_connected_wallets')} value={HomeTabType.ConnectedWallets} />
                            </MaskTabList>
                        </Box>
                        <TabPanel className={classes.panel} value={HomeTabType.SocialAccounts}>
                            <SocialAccounts
                                accounts={accounts}
                                networks={networks}
                                onConnect={onConnect}
                                onAccountClick={onAccountClick}
                            />
                        </TabPanel>
                        <TabPanel className={classes.panel} value={HomeTabType.ConnectedWallets}>
                            <ConnectedWallet wallets={bindingWallets} />
                        </TabPanel>
                    </TabContext>
                ) : (
                    <Box sx={{ background: theme.palette.maskColor.bottom }}>
                        <Box className={classes.emptyHeader}>
                            <Icons.MaskSquare width={160} height={46} />
                        </Box>
                        <Box className={classes.placeholder}>
                            <Typography className={classes.placeholderTitle}>
                                {t('popups_welcome_to_mask_network')}
                            </Typography>
                            <Typography className={classes.placeholderDescription}>
                                {t('popups_persona_description')}
                            </Typography>
                        </Box>
                        <div className={classes.controller}>
                            <Button
                                onClick={onCreatePersona}
                                startIcon={<Icons.AddUser color={theme.palette.maskColor.bottom} size={18} />}>
                                {t('popups_create_persona')}
                            </Button>
                            <Button
                                onClick={onRestore}
                                variant="outlined"
                                startIcon={<Icons.PopupRestore color={theme.palette.maskColor.bottom} size={18} />}>
                                {t('popups_restore_and_login')}
                            </Button>
                        </div>
                    </Box>
                )}
            </div>
        )
    },
)
