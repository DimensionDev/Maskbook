import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Typography } from '@mui/material'
interface Props {
    message: string
    imageUrl: string
}

const useStyles = makeStyles()((theme) => ({
    box: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    noData: {
        paddingBottom: '-12px',
        color: '#7b8192',
        fontSize: '12px',
    },
}))

const PreviewBox = (props: Props) => {
    const classes = useStylesExtends(useStyles(), {})

    return (
        <div className={classes.box}>
            {props.message && <div />}
            {props.imageUrl && <img src="" />}
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
