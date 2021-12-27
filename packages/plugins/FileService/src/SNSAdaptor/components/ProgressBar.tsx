import { formatFileSize } from '@dimensiondev/kit'
import { Typography, LinearProgress, Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales/i18n_generated'

const useStyles = makeStyles()({
    container: {
        height: 250,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        userSelect: 'none',
        paddingTop: 18,
        paddingBottom: 18,
    },
    progress: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        width: 400,
    },
    meta: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        margin: 0,
        color: '#939393',
        fontSize: 12,
        lineHeight: 1.75,
    },
})

interface Props {
    preparing: boolean

    startedAt: number
    fileSize: number
    sendSize: number
}

export const ProgressBar: React.FC<Props> = (props) => {
    const t = useI18N()
    const { classes } = useStyles()
    const { startedAt, fileSize, sendSize } = props
    const value = (sendSize / fileSize) * 100
    const elapsed = (Date.now() - startedAt) / 1000
    const remaining = (fileSize - sendSize) / (elapsed ? sendSize / elapsed : 0)
    const variant = props.preparing ? 'indeterminate' : 'determinate'
    let completion = t.uploading_preparing()
    if (!props.preparing) {
        completion = `${formatFileSize(sendSize)} of ${formatFileSize(fileSize)}`
    }
    return (
        <Box className={classes.progress}>
            <Typography className={classes.meta}>
                <Duration value={remaining} />
                <span>{completion}</span>
            </Typography>
            <Box
                sx={{
                    width: '100%',
                }}>
                <LinearProgress variant={variant} value={value} />
            </Box>
        </Box>
    )
}

const Duration: React.FC<{ value: number }> = ({ value }) => {
    const t = useI18N()
    const render = () => {
        if (!Number.isFinite(value)) {
            return t.uploading_estimating_time()
        } else if (value < 60) {
            return t.uploading_in_minute_remaining({ seconds: value.toFixed(0) })
        }
        return t.uploading_remaining({
            minutes: Math.trunc(value / 60) + '',
            seconds: (value % 60).toFixed(0),
        })
    }
    return <span>{render()}</span>
}
