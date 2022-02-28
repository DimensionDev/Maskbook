import { useWizardDialogStyles, WizardDialog } from './WizardDialog'
import { useI18N } from '../../../utils'
import { useState } from 'react'
import { SetupGuideStep } from './types'
import { Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material'
import { MaskIcon } from '../../../resources/MaskIcon'
import ExtensionIcon from '@mui/icons-material/Extension'
import { PinIcon } from '@masknet/icons'
import { dismissPinExtensionTip } from '../../../settings/settings'

interface PinExtensionProps {
    onDone?: () => void
}

export function PinExtension({ onDone }: PinExtensionProps) {
    const pinImg = new URL('../../../resources/extensionPinned.png', import.meta.url).toString()
    const { classes } = useWizardDialogStyles()
    const { t } = useI18N()
    const [checked, setChecked] = useState(true)

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
                            style={{ filter: 'drop-shadow(0px 0px 16px rgba(101, 119, 134, 0.2))' }}
                        />
                    </Box>
                </Box>
            }
            tip={
                <Typography className={classes.tip} component="div">
                    <div>{t('setup_guide_pin_tip_0')}</div>
                    <ol style={{ paddingLeft: '24px' }}>
                        <li>
                            {t('setup_guide_pin_tip_1')}
                            <ExtensionIcon sx={{ fontSize: 16, color: '#ababab' }} />
                            {t('setup_guide_pin_tip_1_s')}
                        </li>
                        <li>
                            {t('setup_guide_pin_tip_2')}
                            <PinIcon sx={{ fontSize: 16 }} />
                            {t('setup_guide_pin_tip_2_s')}
                        </li>
                        <li>{t('setup_guide_pin_tip_3')}</li>
                    </ol>
                </Typography>
            }
            footer={
                <Button className={classes.button} variant="contained" onClick={onDone}>
                    {t('start')}
                </Button>
            }
            dismiss={
                <FormControlLabel
                    classes={{ label: classes.label }}
                    control={
                        <Checkbox
                            checked={checked}
                            onChange={(e) => {
                                setChecked(e.target.checked)
                                dismissPinExtensionTip.value = e.target.checked
                            }}
                        />
                    }
                    label={t('setup_guide_pin_dismiss')}
                />
            }
            onClose={onDone}
        />
    )
}
