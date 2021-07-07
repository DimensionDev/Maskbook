import { memo } from 'react'
import { experimentalStyled as styled, Typography, LinearProgress, makeStyles, Link } from '@material-ui/core'
import { formatFileSize } from '@dimensiondev/kit'

const useStyles = makeStyles((theme) => ({
    file: {},
    info: {
        padding: theme.spacing(1),
        display: 'flex',
        justifyContent: 'space-between',
    },
}))
const Container = styled('div')`
    border-radius: 8px;
    background-color: #f7f9fa;
`

export interface UploadFileProgressProps {
    file?: File
    sendSize?: number
}

export const UploadFileProgress = memo<UploadFileProgressProps>(({ file, sendSize = 0 }) => {
    const classes = useStyles()
    const value = (sendSize ?? 0 / (file?.size ?? 1)) * 100
    return (
        <>
            {file ? (
                <Container>
                    <div className={classes.info}>
                        <Typography variant="body2" className={classes.file}>
                            {file?.name ?? 'abc.txt'}
                        </Typography>
                        <Typography variant="body2">
                            {formatFileSize(sendSize)}/{formatFileSize(file?.size ?? 0)}
                        </Typography>
                    </div>
                    <LinearProgress value={value} variant="determinate" />
                </Container>
            ) : (
                <Typography variant="body1" color="textPrimary">
                    Mask Network uses Arweave, IPFS, etc. for storage services, please check the{' '}
                    <Link href="#">Privacy policy</Link>.
                </Typography>
            )}
        </>
    )
})
