import { createStyles, DialogContent, makeStyles, Typography } from '@material-ui/core'
import classNames from 'classnames'
import { useCallback, useState } from 'react'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { Linking } from './Linking'

const useStyles = makeStyles((theme) =>
    createStyles({
        tag: {
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.grey[200],
            color: theme.palette.text.secondary,
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
            whiteSpace: 'nowrap',
            marginRight: theme.spacing(1),
        },

        seaAll: {
            cursor: 'pointer',
            color: theme.palette.text.primary,
        },

        content: {
            wordBreak: 'break-all',
        },
    }),
)

export interface CoinMetadataTagsProps {
    tags?: string[]
}

export function CoinMetadataTags(props: CoinMetadataTagsProps) {
    const classes = useStyles()
    const { tags } = props
    const [openSeaAll, setOpenSeaAll] = useState(false)

    const OpenSeaAllDialog = useCallback(() => {
        setOpenSeaAll(!openSeaAll)
    }, [openSeaAll])

    const onClose = useCallback(() => {
        setOpenSeaAll(false)
    }, [])
    return (
        <>
            {tags?.map((x, i) =>
                i < 4 ? <Linking key={i} href={x} TypographyProps={{ className: classes.tag }} /> : null,
            )}
            {tags?.length! > 4 ? (
                <Typography
                    variant="body2"
                    color="primary"
                    component="span"
                    className={classNames(classes.tag, classes.seaAll)}
                    onClick={OpenSeaAllDialog}>
                    View all
                </Typography>
            ) : null}

            <TagsDialog open={openSeaAll} onClose={onClose} tags={tags} />
        </>
    )
}

interface TagsDialogProps {
    open: boolean
    tags?: string[]
    onClose: () => void
}

function TagsDialog(props: TagsDialogProps) {
    const { open, tags, onClose } = props
    const classes = useStyles()
    return (
        <InjectedDialog open={open} title="Tags" onClose={onClose}>
            <DialogContent className={classes.content}>
                {tags?.map((x, i) => (
                    <Linking key={i} href={x} TypographyProps={{ className: classes.tag }} />
                ))}
            </DialogContent>
        </InjectedDialog>
    )
}
