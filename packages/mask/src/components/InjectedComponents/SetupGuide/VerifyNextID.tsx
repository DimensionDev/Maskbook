import { useI18N } from '../../../utils'
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material'
import { MaskIcon } from '../../../resources/MaskIcon'
import classNames from 'classnames'
import { VerifiedIcon } from '@masknet/icons'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useWizardDialogStyles, WizardDialogProps, WizardDialog } from './WizardDialog'
import { useFindUsernameStyles } from './FindUsername'
import { SetupGuideStep } from './types'
import { dismissVerifyNextID } from '../../../settings/settings'
import { useState } from 'react'
import type { PersonaIdentifier } from '@masknet/shared-base'

interface VerifyNextIDProps extends Partial<WizardDialogProps> {
    username: string
    personaName?: string
    personaIdentifier?: PersonaIdentifier
    network: string
    avatar?: string
    disableVerify: boolean
    onUsernameChange?: (username: string) => void
    onVerify: () => Promise<void>
    onDone?: () => void
}

export const VerifyNextID = ({
    personaName,
    personaIdentifier,
    username,
    avatar,
    onVerify,
    onDone,
    onClose,
    network,
    disableVerify,
}: VerifyNextIDProps) => {
    const { t } = useI18N()

    const { classes } = useWizardDialogStyles()
    const { classes: findUsernameClasses } = useFindUsernameStyles()
    const [checked, setChecked] = useState(false)

    if (!personaIdentifier) return null

    return (
        <WizardDialog
            dialogType={SetupGuideStep.FindUsername}
            small={!username}
            content={
                <Box className={classes.connection}>
                    <Box className={classes.connectItem}>
                        <MaskIcon size={48} />
                        <Typography variant="body2" className={classes.name}>
                            {personaName}
                        </Typography>
                    </Box>
                    {username ? (
                        <>
                            <Box className={classes.line} />
                            <Box className={classes.connectItem}>
                                <Box position="relative" width={48}>
                                    <img src={avatar} className={classNames(findUsernameClasses.avatar, 'connected')} />
                                    <VerifiedIcon className={findUsernameClasses.verified} />
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
                <Typography
                    className={classes.tip}
                    variant="body2"
                    dangerouslySetInnerHTML={{
                        __html: !username
                            ? t('setup_guide_login')
                            : `<p>${t('user_guide_tip_connected')}</p><p>${t(
                                  'user_guide_tip_need_verify_on_next_id',
                              )}</p>`,
                    }}
                />
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
