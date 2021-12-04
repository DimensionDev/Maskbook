import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Typography } from '@mui/material'
import classNames from 'classnames'
interface Props {
    message?: string | undefined
    imageUrl?: string | undefined
}

const useStyles = makeStyles()((theme) => ({
    box: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100% - 16px)',
        border: '1px dashed #bbb',
        borderRadius: '4px',
        marginTop: '16px',
        boxSizing: 'border-box',
        padding: '8px',
    },
    msgBox: {
        width: '96%',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 0 8px #ddd',
        opacity: 1,
        pointerEvents: 'none',
        transition: 'all 200ms',
        padding: '12px',
        fontSize: '12px',
        lineHeight: '16px',
        color: '#222',
        textAlign: 'center',
        marginBottom: '12px',
        '&:before': {
            content: '""',
            width: '8px',
            height: '8px',
            backgroundColor: '#fff',
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            boxShadow: '3px 3px 6px #ccc',
            transform: 'translateX(-50%) rotate(45deg)',
        },

        '@keyframes word-show': {
            '0%': {
                opacity: '0',
                transform: 'scale3d(1, 1, 1)',
            },
            '30%': {
                transform: 'scale3d(1.25, 0.75, 1)',
            },
            '40%': {
                transform: 'scale3d(0.75, 1.25, 1)',
            },
            '50%': {
                transform: 'scale3d(1.15, 0.85, 1)',
            },
            '65%': {
                transform: 'scale3d(0.95, 1.05, 1)',
            },
            '75%': {
                transform: 'scale3d(1.05, 0.95, 1)',
            },
            '100%': {
                transform: 'scale3d(1, 1, 1)',
            },
        },
    },
    wordShow: {
        animation: 'word-show 0.9s both;',
    },
    image: {
        borderRadius: '4px',
        width: '100%',
        opacity: '0',
        transition: 'all 200ms',
        '@keyframes image-show': {
            '0%': {
                opacity: '0',
            },
            '100%': {
                opacity: '1',
            },
        },
        animation: 'image-show 0.4s both;',
    },
    noData: {
        paddingBottom: '-12px',
        color: '#7b8192',
        fontSize: '12px',
        textAlign: 'center',
    },
}))

function PreviewBox(props: Props) {
    const classes = useStylesExtends(useStyles(), {})

    return (
        <div className={classes.box}>
            {props.message && (
                <div
                    className={classNames({
                        [classes.msgBox]: true,
                        [classes.wordShow]: true,
                    })}>
                    {props.message}
                </div>
            )}
            {props.imageUrl && <img className={classes.image} src={props.imageUrl} />}
            {!(props.message || props.imageUrl) && (
                <div className={classes.noData}>
                    <Typography>Set up to preview</Typography>
                    <Typography>your brand new pet</Typography>
                </div>
            )}
        </div>
    )
}

export default PreviewBox
