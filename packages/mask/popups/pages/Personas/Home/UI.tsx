import { Icons } from '@masknet/icons'
import { PopupHomeTabType, useParamTab } from '@masknet/shared'
import { PopupModalRoutes, PopupRoutes, type EnhanceableSite, type ProfileAccount } from '@masknet/shared-base'
import { MaskTabList, makeStyles } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { Box, Tab, Typography, useTheme } from '@mui/material'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConnectedWallet } from '../../../components/ConnectedWallet/index.js'
import { PersonaAvatar } from '../../../components/PersonaAvatar/index.js'
import { PersonaPublicKey } from '../../../components/PersonaPublicKey/index.js'
import { SelectProvider } from '../../../components/SelectProvider/index.js'
import { SocialAccounts } from '../../../components/SocialAccounts/index.js'
import { useModalNavigate } from '../../../components/index.js'
import type { ConnectedWalletInfo } from '../type.js'
import { Trans } from '@lingui/macro'

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
    groupedButton: {
        // Increasing priority instead of using !important.
        '&&': {
            color: theme.palette.maskColor.second,
        },
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
        background: theme.palette.maskColor.whiteBlue,
    },
}))

interface PersonaHomeUIProps {
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
    }) => {
        const theme = useTheme()
        const navigate = useNavigate()
        const modalNavigate = useModalNavigate()
        const { classes, cx } = useStyles()

        const [currentTab, onChange] = useParamTab<PopupHomeTabType>(PopupHomeTabType.SocialAccounts)

        return (
            <div className={classes.container}>
                {!isEmpty ?
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
                                    <PersonaAvatar size={60} avatar={avatar} pubkey={publicKey!} />
                                    <Box
                                        className={classes.edit}
                                        onClick={() => navigate(PopupRoutes.PersonaAvatarSetting)}>
                                        <Icons.Edit size={12} />
                                    </Box>
                                </Box>
                                <Typography fontSize={18} fontWeight="700" lineHeight="22px" marginTop="8px">
                                    {nickname}
                                </Typography>
                                {fingerprint && publicKey ?
                                    <PersonaPublicKey
                                        classes={{ text: classes.publicKey, icon: classes.icon }}
                                        rawPublicKey={fingerprint}
                                        publicHexString={publicKey}
                                        iconSize={12}
                                    />
                                :   null}
                                <Icons.Settings2
                                    size={20}
                                    className={classes.settings}
                                    onClick={() => modalNavigate(PopupModalRoutes.PersonaSettings)}
                                />
                            </Box>

                            <MaskTabList
                                onChange={onChange}
                                aria-label="persona-tabs"
                                classes={{ root: classes.tabs, grouped: classes.groupedButton }}>
                                <Tab label={<Trans>Social Account</Trans>} value={PopupHomeTabType.SocialAccounts} />
                                <Tab
                                    label={<Trans>Connected Wallet</Trans>}
                                    value={PopupHomeTabType.ConnectedWallets}
                                />
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
                            {bindingWallets?.length ?
                                <ConnectedWallet />
                            :   <SelectProvider />}
                        </TabPanel>
                    </TabContext>
                :   <Box className={classes.container} data-hide-scrollbar>
                        <Box className={classes.emptyHeader}>
                            <Icons.MaskSquare width={160} height={46} />
                        </Box>
                        <Box className={classes.content}>
                            <Box className={classes.titleWrapper}>
                                <Typography className={classes.title}>
                                    <Trans>Welcome to Mask Network</Trans>
                                </Typography>
                                <Typography className={classes.placeholderDescription}>
                                    <Trans>Use Persona to encrypt and decrypt social media posts & messages.</Trans>
                                </Typography>
                            </Box>
                            <Box className={classes.addPersonaWrapper} onClick={onCreatePersona}>
                                <div className={cx(classes.iconWrapper, classes.personaIcon)}>
                                    <Icons.AddUser size={20} color={theme.palette.maskColor.white} />
                                </div>
                                <div>
                                    <Typography className={classes.subTitle}>
                                        <Trans>Create Persona</Trans>
                                    </Typography>
                                    <Typography className={classes.description}>
                                        <Trans>Generate a new persona</Trans>
                                    </Typography>
                                </div>
                            </Box>

                            <Box className={classes.addPersonaWrapper} onClick={onRestore}>
                                <div className={cx(classes.iconWrapper, classes.mnemonicIcon)}>
                                    <Icons.PopupRestore size={20} color={theme.palette.maskColor.white} />
                                </div>
                                <div>
                                    <Typography className={classes.subTitle}>
                                        <Trans>Restore or Login</Trans>
                                    </Typography>
                                    <Typography className={classes.description}>
                                        <Trans>
                                            Support Identity code, private key, local backups or cloud backups to access
                                            your personal data.
                                        </Trans>
                                    </Typography>
                                </div>
                            </Box>
                        </Box>
                    </Box>
                }
            </div>
        )
    },
)
PersonaHomeUI.displayName = 'PersonaHomeUI'
