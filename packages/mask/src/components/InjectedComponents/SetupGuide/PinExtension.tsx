import { useWizardDialogStyles, WizardDialog } from './WizardDialog.js'
import { useI18N } from '../../../utils/index.js'
import { SetupGuideStep } from '../../../../shared/legacy-settings/types.js'
import { Box, Button, Typography } from '@mui/material'
import { MaskIcon } from '@masknet/shared'
import ExtensionIcon from '@mui/icons-material/Extension'
import { Icons } from '@masknet/icons'

interface PinExtensionProps {
    onDone?: () => void
}

export function PinExtension({ onDone }: PinExtensionProps) {
    const pinImg = new URL('../../../resources/extensionPinned.png', import.meta.url).toString()
    const { classes } = useWizardDialogStyles()
    const { t } = useI18N()

    return (
        <WizardDialog
            dialogType={SetupGuideStep.PinExtension}
            content={
                <Box className={classes.connection}>
                    <Box className={classes.connectItem}>
                        <MaskIcon size={48} />
                        <Typography variant="body2" className={classes.name}>
                            Mask Network
                        </Typography>
                    </Box>
                    <Box className={classes.line} />
                    <Box className={classes.connectItem}>
                        <img
                            src={pinImg}
                            width={100}
                            style={{ filter: 'drop-shadow(0 0 16px rgba(101, 119, 134, 0.2))' }}
                        />
                    </Box>
                </Box>
            }
            tip={
                <Typography className={classes.tip} component="div">
                    <div>{t('setup_guide_pin_tip')}</div>
                    <ol style={{ paddingLeft: '24px' }}>
                        <li>
                            {t('setup_guide_pin_tip_step_click_left')}
                            <ExtensionIcon sx={{ fontSize: 16, color: '#ababab' }} />
                            {t('setup_guide_pin_tip_step_click_right')}
                        </li>
                        <li>
                            {t('setup_guide_pin_tip_step_find_left')}
                            <Icons.Pin size={16} />
                            {t('setup_guide_pin_tip_step_find_right')}
                        </li>
                        <li>{t('setup_guide_pin_tip_successfully')}</li>
                    </ol>
                </Typography>
            }
            footer={
                <Button className={classes.button} variant="contained" onClick={onDone}>
                    {t('start')}
                </Button>
            }
            onClose={onDone}
        />
    )
}
