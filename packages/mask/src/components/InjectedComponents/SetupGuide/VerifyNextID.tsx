import { useI18N } from '../../../utils/index.js'
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material'
import { ActionButtonPromise } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { type WizardDialogProps, WizardDialog } from './WizardDialog.js'
import { SetupGuideStep } from '../../../../shared/legacy-settings/types.js'
import { dismissVerifyNextID } from '../../../../shared/legacy-settings/settings.js'
import { useState } from 'react'
import type { PersonaIdentifier } from '@masknet/shared-base'
import { makeStyles, MaskColorVar } from '@masknet/theme'

export const useStyles = makeStyles()((theme) => ({
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
    label: {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: '22px',
    },
}))

interface VerifyNextIDProps extends Partial<WizardDialogProps> {
    username: string
    personaName?: string
    personaIdentifier?: PersonaIdentifier
    network: string
    avatar?: string
    disableVerify: boolean
    onVerify: () => Promise<void>
    onDone?: () => void
}

export function VerifyNextID({
    personaName,
    personaIdentifier,
    username,
    avatar,
    onVerify,
    onDone,
    onClose,
    network,
    disableVerify,
}: VerifyNextIDProps) {
    const { t } = useI18N()

    const { classes, cx } = useStyles()
    const [checked, setChecked] = useState(false)

    if (!personaIdentifier) return null

    return (
        <WizardDialog
            dialogType={SetupGuideStep.VerifyOnNextID}
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
                                    <img src={avatar} className={cx(classes.avatar, 'connected')} />
                                    <Icons.Verification className={classes.verified} />
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
                    ) : (
                        <>
                            <p>{t('user_guide_tip_connected')}</p>
                            <p>{t('user_guide_tip_need_verify_on_next_id')}</p>
                        </>
                    )}
                </Typography>
            }
            footer={
                username ? (
                    <ActionButtonPromise
                        className={classes.button}
                        variant="contained"
                        init={disableVerify ? t('setup_guide_verify_should_change_profile') : t('setup_guide_verify')}
                        waiting={t('setup_guide_verifying')}
                        complete={t('ok')}
                        failed={t('setup_guide_verifying_failed')}
                        executor={onVerify}
                        completeOnClick={onDone}
                        disabled={!username || !personaName || disableVerify}
                        completeIcon={null}
                        failIcon={null}
                        failedOnClick="use executor"
                        data-testid="confirm_button">
                        {t('setup_guide_verify')}
                    </ActionButtonPromise>
                ) : null
            }
            dismiss={
                <FormControlLabel
                    classes={{ label: classes.label }}
                    control={
                        <Checkbox
                            checked={checked}
                            onChange={(e) => {
                                setChecked(e.target.checked)
                                dismissVerifyNextID[network].value = {
                                    ...dismissVerifyNextID[network].value,
                                    [`${username}_${personaIdentifier.toText()}`]: e.target.checked,
                                }
                            }}
                        />
                    }
                    label={t('setup_guide_verify_dismiss')}
                />
            }
            onClose={onClose}
        />
    )
}
