import { useI18N } from '../../../utils'
import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { MaskIcon } from '../../../resources/MaskIcon'
import classNames from 'classnames'
import { VerifiedIcon } from '@masknet/icons'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useWizardDialogStyles, WizardDialogProps, WizardDialog } from './WizardDialog'
import { useFindUsernameStyles } from './FindUsername'
import { SetupGuideStep } from './types'

interface VerifyNextIDProps extends Partial<WizardDialogProps> {
    username: string
    personaName?: string
    avatar?: string
    onUsernameChange?: (username: string) => void
    onVerify: () => Promise<void>
    onDone?: () => void
}

export const VerifyNextID = ({ personaName, username, avatar, onVerify, onDone, onClose }: VerifyNextIDProps) => {
    const { t } = useI18N()
    const [connected, setConnected] = useState(false)

    const { classes } = useWizardDialogStyles()
    const { classes: findUsernameClasses } = useFindUsernameStyles()

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
                                    <img
                                        src={avatar}
                                        className={classNames(findUsernameClasses.avatar, connected ? 'connected' : '')}
                                    />
                                    {connected ? <VerifiedIcon className={findUsernameClasses.verified} /> : null}
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
                            : connected
                            ? t('user_guide_tip_connected')
                            : t('setup_guide_find_username_text'),
                    }}
                />
            }
            footer={
                username ? (
                    <ActionButtonPromise
                        className={classes.button}
                        variant="contained"
                        init={t('setup_guide_connect_auto')}
                        waiting={t('connecting')}
                        complete={t('ok')}
                        failed={t('setup_guide_connect_failed')}
                        executor={onVerify}
                        completeOnClick={onDone}
                        onComplete={() => setConnected(true)}
                        disabled={!username || !personaName}
                        completeIcon={null}
                        failIcon={null}
                        failedOnClick="use executor"
                        data-testid="confirm_button">
                        Verify
                    </ActionButtonPromise>
                ) : null
            }
            onClose={onClose}
        />
    )
}
