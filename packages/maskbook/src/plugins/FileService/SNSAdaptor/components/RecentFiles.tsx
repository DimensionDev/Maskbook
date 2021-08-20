import { Button, List, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import formatDateTime from 'date-fns/format'
import { File } from 'react-feather'
import { useHistory } from 'react-router'
import { useI18N } from '../../../../utils'
import { FileRouter } from '../../constants'
import type { FileInfo } from '../../types'

const useStyles = makeStyles()((theme) => ({
    container: {
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        width: 150,
        paddingLeft: 10,
    },
    heading: {
        fontSize: 14,
        lineHeight: 1.1,
        color: theme.palette.text.primary,
        marginTop: 0,
        marginBottom: 10,
    },
    listing: {
        flex: 1,
    },
    more: {
        fontSize: 14,
        lineHeight: 1.2,
        color: theme.palette.primary.contrastText,
    },
}))

const useItemStyles = makeStyles()({
    root: {
        padding: 0,
        paddingBottom: 10,
        userSelect: 'none',
        cursor: 'pointer',
    },
})

const useItemIconStyles = makeStyles()({
    root: {
        minWidth: 32,
    },
})

const useItemTextStyles = makeStyles()((theme) => ({
    root: {
        margin: 0,
        marginLeft: 3,
    },
    primary: {
        fontSize: 12,
        lineHeight: 1.1,
        color: theme.palette.text.primary,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    secondary: {
        fontSize: 10,
        lineHeight: 1.2,
        color: theme.palette.text.secondary,
    },
}))

interface Props {
    files: FileInfo[]
    onMore?(): void
}

export const RecentFiles: React.FC<Props> = ({ files, onMore }) => {
    const { t } = useI18N()
    const history = useHistory()
    const { classes } = useStyles()
    const { classes: itemClasses } = useItemStyles()
    const { classes: itemIconClasses } = useItemIconStyles()
    const { classes: itemTextClasses } = useItemTextStyles()
    const onClick = (info: FileInfo) => () => {
        history.replace(FileRouter.uploaded, info)
    }
    const renderItem = (file: FileInfo, index: number) => (
        <ListItem classes={itemClasses} key={index} onClick={onClick(file)}>
            <ListItemIcon classes={itemIconClasses}>
                <File width={32} height={32} />
            </ListItemIcon>
            <ListItemText
                classes={itemTextClasses}
                primary={file.name}
                secondary={formatDateTime(file.createdAt, 'yyyy-MM-dd HH:mm')}
            />
        </ListItem>
    )
    return (
        <section className={classes.container}>
            <Typography className={classes.heading}>{t('plugin_file_service_recent_files')}</Typography>
            <List className={classes.listing}>{files.slice(0, 4).map(renderItem)}</List>
            {onMore && (
                <Button className={classes.more} onClick={onMore}>
                    {t('plugin_file_service_show_more')}
                </Button>
            )}
        </section>
    )
}
