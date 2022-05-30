import { DialogContent, Stack, Typography } from '@mui/material'
import { makeStyles, MaskDialog, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../locales'
import { getCrossChainBridge } from '../constants'
import { openWindow } from '@masknet/shared-base-ui'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: 600,
    },
    paperRoot: {
        backgroundImage: 'none',
        '&>h2': {
            height: 30,
            border: `1px solid ${theme.palette.divider}`,
            padding: theme.spacing(1.875, 2.5, 1.875, 2.5),
            marginBottom: 24,
        },
    },
    content: {
        width: 552,
        maxHeight: 510,
        paddingBottom: theme.spacing(3),
    },
    bridgeItem: {
        display: 'flex',
        padding: '12px',
        ':hover': {
            backgroundColor: theme.palette.background.default,
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

export interface CrossChainBridgeDialogProps extends withClasses<never | 'root'> {
    open: boolean
    onClose(): void
}

export function CrossChainBridgeDialog(props: CrossChainBridgeDialogProps) {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { open, onClose } = props
    // @ts-ignore
    const bridges = getCrossChainBridge(t)

    return (
        <MaskDialog
            DialogProps={{ classes: { paper: classes.paperRoot } }}
            title={t.__plugin_name()}
            open={open}
            onBack={onClose}>
            <DialogContent className={classes.content}>
                <Stack height="100%" spacing={2}>
                    {bridges?.map((bridge) => (
                        <div className={classes.bridgeItem} key={bridge?.ID} onClick={() => openWindow(bridge?.link)}>
                            {bridge?.icon}
                            <div className={classes.bridgeInfo}>
                                <div className={classes.bridgeName}>
                                    {bridge?.name}
                                    {bridge?.isOfficial && (
                                        <Typography className={classes.officialTag}>{t.official()}</Typography>
                                    )}
                                </div>
                                {bridge?.intro && (
                                    <Typography className={classes.bridgeIntro}>{bridge.intro}</Typography>
                                )}
                            </div>
                        </div>
                    ))}
                </Stack>
            </DialogContent>
        </MaskDialog>
    )
}
