// /* eslint-disable no-restricted-imports */
// /* eslint-disable spaced-comment */
// /* eslint-disable eqeqeq */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import { TreeItemContentProps, useTreeItem } from '@mui/lab/TreeItem'
import { Fade, Grid, Typography, Avatar } from '@mui/material'
import * as React from 'react'
import clsx from 'clsx'
import type { TreeNftData } from '../../types'
import { makeStyles } from '@masknet/theme'
import { CheckIcon } from './SvgIcons'

const useStyles = makeStyles()((theme) => {
    return {
        itemWrapper: {
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            height: 128,
            margin: 10,
            border: '0x solid blue',
            width: 'auto',
            float: 'left',
        },
        itemLabel: {
            width: '100px',
            border: '0px solid red',
            float: 'left',
            display: 'block',
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            paddingLeft: '0px !important',
        },
        itemAvtar: {
            width: '100px',
            height: '100px',
            border: '0px solid red',
            float: 'left',
            display: 'block',
            borderRadius: '10px',
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            paddingLeft: '0px !important',
        },
        checkBoxContainer: {
            position: 'relative',
            display: 'block',
            right: '-65px',
            top: '0px',
            height: '32px',
            width: '32px',
        },
    }
})

const TreeChildItemContent = React.forwardRef(function CustomContent(
    props: TreeItemContentProps & {
        nftData?: TreeNftData
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleSelection?: any
    },
    ref,
) {
    const customClasses = useStyles().classes

    const { classes, label, nodeId, icon: iconProp, expansionIcon, displayIcon, handleSelection } = props

    const nftData = props.nftData

    const { disabled, expanded, selected, focused } = useTreeItem(nodeId)

    const icon = iconProp || expansionIcon || displayIcon

    const handleSelectionClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        collection_index: number | undefined,
        item_index: number | undefined,
    ) => {
        handleSelection(collection_index, item_index)
        // nftList[0].tokens[0].is_selected = !nftList[0].tokens[0].is_selected
    }
    // in your component
    // https://trader.xyz/images/missing-img-lg.png
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
                className={clsx(customClasses.itemWrapper, classes.root, {
                    [classes.expanded]: expanded,
                    [classes.selected]: selected,
                    [classes.focused]: focused,
                    [classes.disabled]: disabled,
                })}
                onClick={(event) => handleSelectionClick(event, nftData?.collection_index, nftData?.item_index)}
                ref={ref as React.Ref<HTMLDivElement>}>
                <Grid container direction="column" justifyContent="center" alignItems="center">
                    <Grid item>
                        <Avatar className={customClasses.itemAvtar} children={child} src={nftData?.image_preview_url} />
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
