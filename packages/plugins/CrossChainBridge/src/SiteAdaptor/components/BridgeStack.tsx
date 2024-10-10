import { Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { openWindow } from '@masknet/shared-base-ui'
import { PLUGIN_ID } from '../../constants.js'
import {
    CBridgeIcon,
    ArbitrumOneBridgeIcon,
    OrbiterFinanceIcon,
    PolygonBridgeIcon,
    RainbowBridgeIcon,
} from '../MaskIcon.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    bridgeItem: {
        display: 'flex',
        padding: '12px',
        borderRadius: '8px',
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

export function BridgeStack() {
    const { classes } = useStyles()

    return (
        <Stack height="100%" spacing={2}>
            {useGetCrossChainBridge().map((bridge) => (
                <div className={classes.bridgeItem} key={bridge.ID} onClick={() => openWindow(bridge.link)}>
                    {bridge.icon}
                    <div className={classes.bridgeInfo}>
                        <Typography className={classes.bridgeName}>
                            {bridge.name}
                            {bridge.isOfficial ?
                                <Typography className={classes.officialTag} component="span">
                                    Official
                                </Typography>
                            :   null}
                        </Typography>
                        {bridge.intro ?
                            <Typography className={classes.bridgeIntro}>{bridge.intro}</Typography>
                        :   null}
                    </div>
                </div>
            ))}
        </Stack>
    )
}

export function useGetCrossChainBridge() {
    return [
        {
            name: 'CBridge',
            ID: `${PLUGIN_ID}_cBridge`,
            intro: <Trans>Powered by Celer Network. Support $MASK!</Trans>,
            icon: <CBridgeIcon />,
            isOfficial: false,
            link: 'https://cbridge.celer.network/#/transfer',
        },
        {
            name: 'Arbitrum One Bridge',
            ID: `${PLUGIN_ID}_arbitrum_one_bridge`,
            isOfficial: true,
            icon: <ArbitrumOneBridgeIcon />,
            link: 'https://bridge.arbitrum.io/',
        },
        {
            name: 'Orbiter Finance',
            ID: `${PLUGIN_ID}_orbiter_finance`,
            isOfficial: true,
            icon: <OrbiterFinanceIcon />,
            link: 'https://www.orbiter.finance/',
        },
        {
            name: 'Polygon Bridge',
            ID: `${PLUGIN_ID}_polygon_bridge`,
            isOfficial: true,
            icon: <PolygonBridgeIcon />,
            link: 'https://wallet.polygon.technology/polygon/bridge/',
        },
        {
            name: 'Rainbow Bridge',
            ID: `${PLUGIN_ID}_rainbow_bridge`,
            isOfficial: true,
            icon: <RainbowBridgeIcon />,
            link: 'https://rainbowbridge.app/transfer',
        },
    ]
}
