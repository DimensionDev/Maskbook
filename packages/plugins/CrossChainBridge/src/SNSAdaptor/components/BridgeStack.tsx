import { Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { openWindow } from '@masknet/shared-base-ui'
import { getCrossChainBridge } from '../../constants.js'
import { useI18N } from '../../locales/index.js'

const useStyles = makeStyles()((theme) => ({
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

export interface BridgeStackProps {}

export function BridgeStack(props: BridgeStackProps) {
    const t = useI18N()
    const { classes } = useStyles()

    return (
        <Stack height="100%" spacing={2}>
            {getCrossChainBridge(t).map((bridge) => (
                <div className={classes.bridgeItem} key={bridge.ID} onClick={() => openWindow(bridge.link)}>
                    {bridge.icon}
                    <div className={classes.bridgeInfo}>
                        <Typography className={classes.bridgeName}>
                            {bridge.name}
                            {bridge.isOfficial ? (
                                <Typography className={classes.officialTag} component="span">
                                    {t.official()}
                                </Typography>
                            ) : null}
                        </Typography>
                        {bridge.intro ? <Typography className={classes.bridgeIntro}>{bridge.intro}</Typography> : null}
                    </div>
                </div>
            ))}
        </Stack>
    )
}
