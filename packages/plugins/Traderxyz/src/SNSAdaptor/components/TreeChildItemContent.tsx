import { TreeItemContentProps, useTreeItem } from '@mui/lab/TreeItem'
import { Fade, Grid, Typography, Avatar } from '@mui/material'
import * as React from 'react'
import type { TreeNftData } from '../../types'
import { makeStyles } from '@masknet/theme'
import { CheckIcon } from './SvgIcons'

const useStyles = makeStyles()((theme) => {
    return {
        itemWrapper: {
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            height: 128,
            margin: 10,
            width: 'auto',
            float: 'left',
        },
        itemLabel: {
            width: 100,
            border: '0px solid red',
            float: 'left',
            display: 'block',
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            paddingLeft: '0px !important',
        },
        itemAvatar: {
            width: 100,
            height: 100,
            float: 'left',
            display: 'block',
            borderRadius: 10,
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            paddingLeft: '0px !important',
        },
        checkBoxContainer: {
            position: 'relative',
            display: 'block',
            right: -65,
            top: 0,
            height: theme.spacing(4),
            width: theme.spacing(4),
        },
    }
})

const TreeChildItemContent = React.forwardRef(function CustomContent(
    props: TreeItemContentProps & {
        nftData?: TreeNftData
        onSelected?(collectionIndex?: number, itemIndex?: number): void
    },
    ref,
) {
    const customClasses = useStyles().classes

    const { cx } = useStyles()

    const { classes, label, nodeId, icon: iconProp, expansionIcon, displayIcon, onSelected } = props

    const nftData = props.nftData

    const { disabled, expanded, selected, focused } = useTreeItem(nodeId)

    const icon = iconProp || expansionIcon || displayIcon

    const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        onSelected?.(nftData?.collection_index, nftData?.item_index)
    }
    const child = (
        <img
            alt="no-image"
            src={new URL('../assets/missing-img.png', import.meta.url).toString()}
            style={{ width: 100, height: 100 }}
        />
    )

    return (
        <Fade in key={nodeId}>
            <div
                key={nodeId}
                className={cx(customClasses.itemWrapper, classes.root, {
                    [classes.expanded]: expanded,
                    [classes.selected]: selected,
                    [classes.focused]: focused,
                    [classes.disabled]: disabled,
                })}
                onClick={handleClick}
                ref={ref as React.Ref<HTMLDivElement>}>
                <Grid container direction="column" justifyContent="center" alignItems="center">
                    <Grid item>
                        <Avatar
                            className={customClasses.itemAvatar}
                            children={child}
                            src={nftData?.image_preview_url}
                        />
                        {nftData?.is_selected === true && (
                            <div className={customClasses.checkBoxContainer}>
                                <CheckIcon />
                            </div>
                        )}
                    </Grid>
                    <Grid item>
                        <Typography component="div" className={customClasses.itemLabel}>
                            {label}
                        </Typography>
                    </Grid>
                </Grid>
            </div>
        </Fade>
    )
})

export default TreeChildItemContent
