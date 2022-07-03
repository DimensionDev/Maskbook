import { useWizardDialogStyles, WizardDialog } from './WizardDialog'
import { useI18N } from '../../../utils'
import { SetupGuideStep } from './types'
import { Box, Button, Typography, useMediaQuery, type Theme } from '@mui/material'
import { MaskIcon } from '../../../resources/MaskIcon'
import ExtensionIcon from '@mui/icons-material/Extension'
import { Pin as PinIcon } from '@masknet/icons'

interface PinExtensionProps {
    onDone?: () => void
}

export function PinExtension({ onDone }: PinExtensionProps) {
    const pinImg = new URL('../../../resources/extensionPinned.png', import.meta.url).toString()
    const { classes } = useWizardDialogStyles()
    const { t } = useI18N()
    const isMini = useMediaQuery<Theme>((theme) => theme.breakpoints.down('xs'))

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
                            <PinIcon size={isMini ? 16 : 22} />
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
