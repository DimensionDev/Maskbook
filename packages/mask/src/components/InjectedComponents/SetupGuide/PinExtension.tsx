import { Icons } from '@masknet/icons'
import { SetupGuideStep } from '@masknet/shared-base'
import { MaskColorVar, makeStyles } from '@masknet/theme'
import { Extension as ExtensionIcon } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import { useMaskSharedTrans } from '../../../utils/index.js'
import { WizardDialog } from './WizardDialog.js'

interface PinExtensionProps {
    onDone?: () => void
    onClose?: () => void
}

export const useStyles = makeStyles()((theme) => ({
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

export function PinExtension({ onDone, onClose }: PinExtensionProps) {
    const pinImg = new URL('../../../resources/extensionPinned.png', import.meta.url).toString()
    const { classes } = useStyles()
    const { t } = useMaskSharedTrans()

    return (
        <WizardDialog
            dialogType={SetupGuideStep.PinExtension}
            content={
                <Box className={classes.connection}>
                    <Box className={classes.connectItem}>
                        <Icons.MaskBlue size={48} />
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
            onClose={onClose}
        />
    )
}
