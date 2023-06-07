import { DialogContent, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../locales/index.js'
import { getCrossChainBridge } from '../constants.js'
import { openWindow } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    content: {
        height: 532,
        padding: theme.spacing(2),
    },
    bridgeItem: {
        display: 'flex',
        padding: '12px',
        ':hover': {
            backgroundColor: theme.palette.maskColor.bg,
            cursor: 'pointer',
        },
    },
    bridgeInfo: {
        marginLeft: '8px',
    },
    bridgeName: {
        fontSize: '24px',
        fontWeight: 600,
        display: 'flex',
    },
    bridgeIntro: {
        fontSize: '12px',
        fontWeight: 400,
        color: theme.palette.grey[700],
    },
    officialTag: {
        width: '39px',
        height: '15px',
        fontSize: '12px',
        fontWeight: 700,
        alignSelf: 'center',
        borderRadius: '8px',
        backgroundColor: 'rgba(28, 104, 243, 0.1)',
        color: '#1c68f3',
        padding: '4px 12px 6px 8px',
        marginLeft: '4px',
    },
}))

export interface CrossChainBridgeDialogProps extends withClasses<'root'> {
    open: boolean
    onClose(): void
}

export function CrossChainBridgeDialog(props: CrossChainBridgeDialogProps) {
    const t = useI18N()
    const { classes } = useStyles(undefined, { props })
    const { open, onClose } = props
    const bridges = getCrossChainBridge(t)

    return (
        <InjectedDialog title={t.__plugin_name()} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Stack height="100%" spacing={2}>
                    {bridges?.map((bridge) => (
                        <div className={classes.bridgeItem} key={bridge?.ID} onClick={() => openWindow(bridge?.link)}>
                            {bridge?.icon}
                            <div className={classes.bridgeInfo}>
                                <Typography className={classes.bridgeName}>
                                    {bridge?.name}
                                    {bridge?.isOfficial ? (
                                        <Typography className={classes.officialTag}>{t.official()}</Typography>
                                    ) : null}
                                </Typography>
                                {bridge?.intro ? (
                                    <Typography className={classes.bridgeIntro}>{bridge.intro}</Typography>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </Stack>
            </DialogContent>
        </InjectedDialog>
    )
}
