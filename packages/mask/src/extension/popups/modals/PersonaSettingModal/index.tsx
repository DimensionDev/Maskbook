import { memo } from 'react'
import { ActionModal, useModalNavigate, type ActionModalBaseProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { PersonaContext } from '@masknet/shared'
import { PersonaAvatar } from '../../components/PersonaAvatar/index.js'
import { Icons } from '@masknet/icons'
import { PersonaPublicKey } from '../../components/PersonaPublicKey/index.js'
import { PopupModalRoutes, PopupRoutes } from '@masknet/shared-base'
import { UserContext } from '../../hook/useUserContext.js'
import { useNavigate } from 'react-router-dom'

const useStyles = makeStyles()((theme) => ({
    avatarItem: {
        padding: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    item: {
        padding: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    avatar: {
        boxShadow: '0px 6px 12px 0px rgba(29, 161, 242, 0.20)',
        backdropFilter: 'blur(8px)',
    },
    text: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
    arrow: {
        color: theme.palette.maskColor.second,
        cursor: 'pointer',
    },
    icon: {
        color: theme.palette.maskColor.second,
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        columnGap: theme.spacing(1.5),
    },
}))

export const PersonaSettingModal = memo<ActionModalBaseProps>(function PersonaSettingModal({ ...rest }) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { user } = UserContext.useContainer()
    const { currentPersona, avatar, proofs } = PersonaContext.useContainer()
    const navigate = useNavigate()
    const modalNavigate = useModalNavigate()

    return (
        <ActionModal
            header={t('persona')}
            action={
                <ActionButton variant="contained" color="error" onClick={() => navigate(PopupRoutes.Logout)}>
                    {t('popups_log_out')}
                </ActionButton>
            }
            {...rest}>
            <Box className={classes.avatarItem}>
                <Typography className={classes.text}>{t('popups_profile_photo')}</Typography>
                <Box className={classes.right}>
                    <PersonaAvatar
                        avatar={avatar}
                        hasProofs={!!proofs?.length}
                        size={48}
                        classes={{ root: classes.avatar }}
                    />
                    <Icons.ArrowRight
                        size={24}
                        className={classes.arrow}
                        onClick={() => navigate(PopupRoutes.PersonaAvatarSetting)}
                    />
                </Box>
            </Box>
            <Box className={classes.item}>
                <Typography className={classes.text}>{t('popups_next_id')}</Typography>
                {currentPersona ? (
                    <PersonaPublicKey
                        rawPublicKey={currentPersona.identifier.rawPublicKey}
                        publicHexString={currentPersona.identifier.publicKeyAsHex}
                        iconSize={16}
                        classes={{ icon: classes.icon, text: classes.text }}
                    />
                ) : null}
            </Box>
            <Box className={classes.item}>
                <Typography className={classes.text}>{t('popups_name')}</Typography>
                <Box className={classes.right}>
                    <Typography className={classes.text}>{currentPersona?.nickname}</Typography>
                    <Icons.ArrowRight
                        size={24}
                        className={classes.arrow}
                        onClick={() => modalNavigate(PopupModalRoutes.PersonaRename)}
                    />
                </Box>
            </Box>
            <Box className={classes.item}>
                <Typography className={classes.text}>{t('popups_backup_persona')}</Typography>
                <Icons.ArrowRight
                    size={24}
                    className={classes.arrow}
                    onClick={() => {
                        modalNavigate(
                            !user.backupPassword
                                ? PopupModalRoutes.SetBackupPassword
                                : PopupModalRoutes.verifyBackupPassword,
                        )
                    }}
                />
            </Box>
        </ActionModal>
    )
})
