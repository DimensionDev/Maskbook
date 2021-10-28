import React from 'react'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import { Tooltip, Typography, Box } from '@mui/material'
import { getAssetAsBlobURL } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
    },
    info: {
        zIndex: 999,
        width: 24,
        height: 26,
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

const Tip = (props: any) => {
    const classes = useStylesExtends(useStyles(), props)
    const Info = getAssetAsBlobURL(new URL('../assets/info.png', import.meta.url))
    const click = () => window.open('https://twitter.com/MintTeamNFT')
    const loots = [
        'Falchion',
        'Chain Mail',
        'Hood',
        'Leather Belt',
        'Chain Boots',
        'Chain Gloves',
        'Amulet of the Twins',
        'Gold Ring',
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
