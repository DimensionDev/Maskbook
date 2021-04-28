import { Chip, createStyles, DialogContent, makeStyles } from '@material-ui/core'
import { useCallback, useState } from 'react'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { Linking } from './Linking'

const useStyles = makeStyles((theme) =>
    createStyles({
        tag: {
            marginRight: theme.spacing(1),
        },
        chip: {
            margin: theme.spacing(1),
        },
    }),
)

export interface CoinMetadataTagsProps {
    tags?: string[]
}

export function CoinMetadataTags(props: CoinMetadataTagsProps) {
    const classes = useStyles()
    const { tags } = props
    const [open, setOpen] = useState(false)

    const onClick = useCallback(() => {
        setOpen(!open)
    }, [open, setOpen])

    const onClose = useCallback(() => {
        setOpen(false)
    }, [setOpen])
    return (
        <>
            {tags?.map((x, i) =>
                i < 4 ? (
                    <Linking key={i} href={x} LinkProps={{ className: classes.tag }}>
                        <Chip label={x.replace(/-/g, ' ')} size="small" />
                    </Linking>
                ) : null,
            )}
            {tags?.length! > 4 ? (
                <>
                    <Linking key={tags?.length! + 1} href={'View all'} LinkProps={{ className: classes.tag }}>
                        <Chip label="View all" color="primary" onClick={onClick} size="small" />
                    </Linking>
                    <TagsDialog open={open} onClose={onClose} tags={tags} />
                </>
            ) : null}
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
        <>
            {tags ? (
                <InjectedDialog open={open} title="Tags" onClose={onClose}>
                    <DialogContent>
                        {tags?.map((x, i) => (
                            <Linking key={i} href={x}>
                                <Chip label={x.replace(/-/g, ' ')} className={classes.chip} />
                            </Linking>
                        ))}
                    </DialogContent>
                </InjectedDialog>
            ) : null}
        </>
    )
}
