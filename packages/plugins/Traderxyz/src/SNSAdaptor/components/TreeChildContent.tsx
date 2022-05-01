import { TreeItemContentProps, useTreeItem } from '@mui/lab/TreeItem'
import { Typography, Avatar } from '@mui/material'
import * as React from 'react'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        itemAvatar: {
            position: 'relative',
            right: '0px',
        },
    }
})

const TreeChildContent = React.forwardRef(function CustomContent(
    props: TreeItemContentProps & {
        collectionImage?: string
    },
    ref,
) {
    const customClasses = useStyles().classes

    const { cx } = useStyles()

    const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon, collectionImage } = props

    const { disabled, expanded, selected, focused, handleExpansion, handleSelection, preventSelection } =
        useTreeItem(nodeId)

    const icon = iconProp || expansionIcon || displayIcon

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        preventSelection(event)
    }

    const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        handleExpansion(event)
    }

    const handleSelectionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        handleSelection(event)
    }
    const child = (
        <img
            alt="no-image"
            src={new URL('../assets/missing-img.png', import.meta.url).toString()}
            style={{ width: 40, height: 40 }}
        />
    )
    return (
        <div
            key={nodeId}
            style={{ paddingTop: '10px' }}
            className={cx(className, classes.root, {
                [classes.expanded]: expanded,
                [classes.selected]: selected,
                [classes.focused]: focused,
                [classes.disabled]: disabled,
            })}
            onClick={handleExpansionClick}
            onMouseDown={handleMouseDown}
            ref={ref as React.Ref<HTMLDivElement>}>
            <div className={classes.iconContainer}>
                <Avatar src={collectionImage} children={child} alt="no-image" className={customClasses.itemAvatar} />
            </div>
            <Typography onClick={handleSelectionClick} component="div" className={classes.label}>
                {label}
            </Typography>
        </div>
    )
})

export default TreeChildContent
