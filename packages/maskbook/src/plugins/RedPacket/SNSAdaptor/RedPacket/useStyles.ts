import { makeStyles, keyframes } from '@masknet/theme'
import { IconURLs } from '../IconURL'

export const useStyles = makeStyles()((theme) => {
    const spinningAnimationKeyFrames = keyframes`
to {
  transform: rotate(360deg)
}`
    return {
        root: {
            borderRadius: theme.spacing(1),
            padding: theme.spacing(3),
            background: '#DB0632',
            position: 'relative',
            display: 'flex',
            color: theme.palette.common.white,
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 335,
            boxSizing: 'border-box',
            backgroundImage: `url(${new URL('./cover.png', import.meta.url)})`,
            backgroundSize: 'cover',
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                padding: theme.spacing(1, 1.5),
                height: 202,
            },
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        content: {
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
        },
        bottomContent: {
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
        },
        footer: {
            paddingTop: theme.spacing(2),
            width: '100%',
            display: 'flex',
            gap: theme.spacing(2),
            justifyContent: 'center',
            '& button': {
                flexBasis: 'auto',
            },
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                flexDirection: 'column',
                gap: theme.spacing(1),
            },
        },
        myStatus: {
            fontSize: 14,
            color: '#FAD85A',
            fontWeight: 'bold',
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                fontSize: 14,
                left: 12,
                bottom: 8,
            },
        },
        from: {
            fontSize: '14px',
            color: '#FFFFFF',
            fontWeight: 'bold',
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                fontSize: 14,
                right: 12,
                bottom: 8,
            },
        },
        label: {
            borderRadius: theme.spacing(1),
            padding: theme.spacing(0.2, 1),
            background: 'rgba(0, 0, 0, 0.2)',
            textTransform: 'capitalize',
            position: 'absolute',
            right: 12,
            top: 8,
        },
        words: {
            color: '#FAD85A',
            fontSize: 20,
            whiteSpace: 'pre',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            width: '85%',
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                fontSize: 14,
            },
        },
        button: {
            color: theme.palette.common.white,
        },
        spinning: {
            display: 'flex',
            animation: `${spinningAnimationKeyFrames} 2s infinite linear`,
        },
        packet: {
            top: 40,
            right: -10,
            width: 90,
            height: 90,
            position: 'absolute',
            backgroundAttachment: 'local',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url(${IconURLs.presentDefault})`,
        },
        dai: {
            backgroundImage: `url(${IconURLs.presentDai})`,
        },
        okb: {
            backgroundImage: `url(${IconURLs.presentOkb})`,
        },
        text: {
            padding: theme.spacing(0.5, 2),
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
        },
        dimmer: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
        cursor: {
            cursor: 'pointer',
        },
        loader: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },
        icon: {
            fontSize: 45,
        },
        metamaskContent: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
        },
        connectWallet: {
            marginTop: 16,
        },
    }
})
