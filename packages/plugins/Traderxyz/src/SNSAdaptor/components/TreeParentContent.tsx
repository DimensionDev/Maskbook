import { TreeItemContentProps, useTreeItem } from '@mui/lab/TreeItem'
import { Avatar, Fade, Typography, AvatarGroup } from '@mui/material'
import * as React from 'react'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        itemAvatar: {
            width: 150,
            border: '0px solid black',
        },
    }
})
const TreeParentContent = React.forwardRef(function CustomContent(
    props: TreeItemContentProps & {
        previewImages?: string[]
    },
    ref,
) {
    const customClasses = useStyles().classes

    const { cx } = useStyles()

    const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon, previewImages } = props

    const { disabled, expanded, selected, focused, handleExpansion } = useTreeItem(nodeId)

    const icon = iconProp || expansionIcon || displayIcon

    const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        handleExpansion(event)
    }

    const child = (
        <img
            alt="no-image"
            src={new URL('../assets/missing-img.png', import.meta.url).toString()}
            style={{ width: 40, height: 40 }}
        />
    )
    const ShowNft = previewImages?.map((item, index) => {
        return <Avatar key={`p-image-${index}`} alt="-" children={child} src={item} />
    })

    return (
        <div
            key={nodeId}
            className={cx(className, classes.root, {
                [classes.expanded]: expanded,
                [classes.selected]: selected,
                [classes.focused]: focused,
                [classes.disabled]: disabled,
            })}
            onClick={handleExpansionClick}
            ref={ref as React.Ref<HTMLDivElement>}>
            <div className={classes.iconContainer}>{icon}</div>
            <Typography component="div" className={classes.label}>
                {label}
            </Typography>
            <Fade in={!expanded}>
                <AvatarGroup total={3} key={`d-${nodeId}`} className={customClasses.itemAvatar}>
                    {ShowNft}
                </AvatarGroup>
            </Fade>
        </div>
    )
})

export default TreeParentContent
