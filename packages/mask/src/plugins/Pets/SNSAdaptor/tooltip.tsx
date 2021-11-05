import React from 'react'
import { makeStyles } from '@masknet/theme'
import { Tooltip, Typography, Box } from '@mui/material'
import { getAssetAsBlobURL, useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
    },
    info: {
        zIndex: 999,
        width: 15,
        height: 15,
        right: -10,
        bottom: 2,
        backgroundRepeat: 'round',
        position: 'absolute',
    },
    content: {
        backgroundColor: 'red',
    },
    title: {
        fontSize: '12px',
        color: '#737373',
        fontWeight: 600,
    },
    des: {
        fontSize: '12px',
        color: '#737373',
        fontWeight: 400,
    },
    arrow: {
        color: theme.palette.common.white,
    },
    tooltip: {
        backgroundColor: theme.palette.common.white,
    },
}))

const Tip = () => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const Info = getAssetAsBlobURL(new URL('../assets/info.png', import.meta.url))
    const click = () => window.open('https://twitter.com/MintTeamNFT')
    const loots = [
        t('plugin_pets_loot_info_0'),
        t('plugin_pets_loot_info_1'),
        t('plugin_pets_loot_info_2'),
        t('plugin_pets_loot_info_3'),
        t('plugin_pets_loot_info_4'),
        t('plugin_pets_loot_info_5'),
        t('plugin_pets_loot_info_6'),
        t('plugin_pets_loot_info_7'),
    ]

    const titleRender = (
        <div style={{ backgroundColor: '#FFFFFF', padding: 12, borderRadius: 4, fontFamily: 'TwitterChirp' }}>
            <Typography style={{ fontSize: '12px', color: '#737373', fontWeight: 600, fontFamily: 'TwitterChirp' }}>
                Loot Properties:
            </Typography>
            {loots.map((txt) => (
                <Typography
                    style={{ fontSize: '12px', color: '#737373', fontWeight: 600, fontFamily: 'TwitterChirp' }}
                    key={txt}>
                    {txt}
                </Typography>
            ))}
            <Typography
                style={{
                    fontSize: '12px',
                    color: '#737373',
                    fontWeight: 400,
                    marginTop: 4,
                    fontFamily: 'TwitterChirp',
                }}>
                Get your NFTshow and News:
            </Typography>
            <Box onClick={click}>
                <Typography
                    style={{
                        fontSize: '12px',
                        color: '#737373',
                        fontWeight: 400,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontFamily: 'TwitterChirp',
                    }}>
                    https://twitter.com/MintTeamNFT
                </Typography>
            </Box>
        </div>
    )
    return (
        <Tooltip
            title={titleRender}
            arrow
            placement="left"
            classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}>
            <div className={classes.info} style={{ backgroundImage: `url(${Info})` }} />
        </Tooltip>
    )
}

export default Tip
