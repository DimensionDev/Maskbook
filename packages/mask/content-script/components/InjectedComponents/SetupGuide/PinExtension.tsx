import { Icons } from '@masknet/icons'
import { SetupGuideStep } from '@masknet/shared-base'
import { MaskColorVar, makeStyles } from '@masknet/theme'
import { Extension as ExtensionIcon } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import { WizardDialog } from './WizardDialog.js'
import { Trans } from '@lingui/macro'

interface PinExtensionProps {
    onDone?: () => void
    onClose?: () => void
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
                    <div>
                        <Trans>Don't forget to pin Mask Network in the browser toolbar to access Web3 easily.</Trans>
                    </div>
                    <ol style={{ paddingLeft: '24px' }}>
                        <li>
                            <Trans>
                                Click on <ExtensionIcon sx={{ fontSize: 16, color: '#ababab' }} /> at the top-right of
                                your browser.
                            </Trans>
                        </li>
                        <li>
                            <Trans>
                                Find Mask Network in the extension list and click the <Icons.Pin size={16} /> button.
                            </Trans>
                        </li>
                        <li>
                            <Trans>Pinned successfully.</Trans>
                        </li>
                    </ol>
                </Typography>
            }
            footer={
                <Button className={classes.button} variant="contained" onClick={onDone}>
                    <Trans>Start</Trans>
                </Button>
            }
            onClose={onClose}
        />
    )
}
