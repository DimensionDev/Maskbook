import { NewFolderIcon, UploadFileIcon } from '@masknet/icons'
import { makeStyles, Typography } from '@material-ui/core'
import { memo } from 'react'

const useStyles = makeStyles((theme) => ({
    section: {
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    item: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing(1),
        cursor: 'pointer',
    },
}))

export interface UploadFileButtonsProps {}

export const UploadFileButtons = memo<UploadFileButtonsProps>(() => {
    const classes = useStyles()

    return (
        <section className={classes.section}>
            <div className={classes.item}>
                <UploadFileIcon width={20} height={20} />
                <Typography variant="body1" color="textPrimary">
                    Upload
                </Typography>
            </div>

            <div className={classes.item}>
                <NewFolderIcon width={20} height={20} />
                <Typography variant="body1" color="textPrimary">
                    New Folder
                </Typography>
            </div>
        </section>
    )
})
