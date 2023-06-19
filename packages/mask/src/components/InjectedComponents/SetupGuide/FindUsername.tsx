import { useState } from 'react'
import { Trans } from 'react-i18next'
import { Box, Typography } from '@mui/material'
import { ActionButtonPromise } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { WizardDialog, type WizardDialogProps } from './WizardDialog.js'
import { useI18N } from '../../../utils/index.js'
import { SetupGuideStep } from '@masknet/shared-base'

export const useFindUsernameStyles = makeStyles()((theme) => ({
    avatar: {
        display: 'block',
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: `solid 1px ${MaskColorVar.border}`,
        '&.connected': {
            borderColor: MaskColorVar.success,
        },
    },
    verified: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        height: 16,
        width: 16,
        color: MaskColorVar.success,
    },
    button: {
        minWidth: 150,
        height: 40,
        minHeight: 40,
        marginLeft: 0,
        marginTop: 0,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
        fontSize: 14,
        wordBreak: 'keep-all',
        '&,&:hover': {
            color: `${MaskColorVar.twitterButtonText} !important`,
            background: `${MaskColorVar.twitterButton} !important`,
        },
    },
    tip: {
        fontSize: 16,
        fontWeight: 500,
        lineHeight: '22px',
        paddingTop: 16,
    },
    connection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    connectItem: {
        flex: 1,
        height: 75,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    line: {
        width: 100,
        height: 1,
        borderTop: `dashed 1px  ${MaskColorVar.borderSecondary}`,
    },
    name: {
        fontSize: 16,
        fontWeight: 500,
    },
}))

export interface FindUsernameProps extends Partial<WizardDialogProps> {
    username: string
    stepUpdating?: boolean
    personaName?: string
    avatar?: string
    onConnect: () => Promise<void>
    onDone?: () => void
    enableNextID?: boolean
}

export function FindUsername({
    personaName,
    username,
    avatar,
    onConnect,
    onDone,
    onClose,
    enableNextID,
    stepUpdating,
}: FindUsernameProps) {
    const { t } = useI18N()
    const { classes, cx } = useFindUsernameStyles()
    const [connected, setConnected] = useState(false)

    return (
        <WizardDialog
            dialogType={SetupGuideStep.FindUsername}
            small={!username}
            content={
                <Box className={classes.connection}>
                    <Box className={classes.connectItem}>
                        <Icons.MaskBlue size={48} />
                        <Typography variant="body2" className={classes.name}>
                            {personaName}
                        </Typography>
                    </Box>
                    {username ? (
                        <>
                            <Box className={classes.line} />
                            <Box className={classes.connectItem}>
                                <Box position="relative" width={48}>
                                    <img src={avatar} className={cx(classes.avatar, connected ? 'connected' : '')} />
                                    {connected ? <Icons.Verification className={classes.verified} /> : null}
                                </Box>
                                <Typography variant="body2" className={classes.name}>
                                    {username}
                                </Typography>
                            </Box>
                        </>
                    ) : null}
                </Box>
            }
            tip={
                <Typography className={classes.tip} variant="body2">
                    {!username ? (
                        t('setup_guide_login')
                    ) : connected ? (
                        t('user_guide_tip_connected')
                    ) : (
                        <Trans i18nKey="setup_guide_find_username_text" components={{ br: <br /> }} />
                    )}
                </Typography>
            }
            footer={
                username ? (
                    <ActionButtonPromise
                        className={classes.button}
                        variant="contained"
                        init={t('setup_guide_connect_auto')}
                        waiting={t('connecting')}
                        complete={enableNextID ? t('setup_guide_verify_checking') : t('ok')}
                        failed={t('setup_guide_connect_failed')}
                        executor={onConnect}
                        completeOnClick={enableNextID ? undefined : onDone}
                        onComplete={enableNextID ? onDone : () => setConnected(true)}
                        disabled={!username || !personaName || stepUpdating}
                        completeIcon={null}
                        failIcon={null}
                        failedOnClick="use executor"
                        data-testid="confirm_button">
                        {t('confirm')}
                    </ActionButtonPromise>
                ) : null
            }
            onClose={onClose}
        />
    )
}
