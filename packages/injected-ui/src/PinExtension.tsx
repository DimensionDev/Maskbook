import { Icons } from '@masknet/icons'
import { SetupGuideStep } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { WizardDialog } from './WizardDialog.js'

export interface PinExtensionProps {
    onDone?: () => void
    onClose?: () => void
    /** Rendered right before the numbered pin-the-extension steps, e.g. localized copy. */
    tip?: React.ReactNode
    /** Rendered as the confirm button label. */
    startLabel?: React.ReactNode
}

const useStyles = makeStyles()((theme) => ({
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
            color: `${theme.vars.palette.text.twitterButtonText} !important`,
            background: `${theme.vars.palette.text.twitterButton} !important`,
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
        borderTop: `dashed 1px ${theme.vars.palette.maskColor.setupGuideBorder}`,
    },
    name: {
        fontSize: 16,
        fontWeight: 500,
    },
}))

export function PinExtension(props: PinExtensionProps) {
    const { onDone, onClose, tip, startLabel = 'Start' } = props
    const pinImg = new URL('./resources/extensionPinned.png', import.meta.url).href
    const { classes } = useStyles()

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
                    {tip}
                </Typography>
            }
            footer={
                <Button className={classes.button} variant="contained" onClick={onDone}>
                    {startLabel}
                </Button>
            }
            onClose={onClose}
        />
    )
}
