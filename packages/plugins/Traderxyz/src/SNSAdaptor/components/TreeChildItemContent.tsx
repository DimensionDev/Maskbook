/* eslint-disable no-restricted-imports */
/* eslint-disable spaced-comment */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TreeItemContentProps, useTreeItem } from '@mui/lab/TreeItem'
import { Fade, Grid, Typography, Avatar } from '@mui/material'
import * as React from 'react'
import clsx from 'clsx'

const TreeChildItemContent = React.forwardRef(function CustomContent(
    props: TreeItemContentProps & {
        nftData?: {
            id: any
            image_preview_url: any
            token_id: any
            is_selected: any
            collection_index: number
            item_index: number
        }
        handleSelection?: any
    },
    ref,
) {
    const {
        classes,
        className,
        label,
        nodeId,
        icon: iconProp,
        expansionIcon,
        displayIcon,
        nftData,
        handleSelection,
    } = props

    const { disabled, expanded, selected, focused, handleExpansion, preventSelection } = useTreeItem(nodeId)

    const icon = iconProp || expansionIcon || displayIcon

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        //preventSelection(event)
    }

    const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        //handleExpansion(event)
    }

    const handleSelectionClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        collection_index: any,
        item_index: any,
    ) => {
        handleSelection(collection_index, item_index)
        //nftList[0].tokens[0].is_selected = !nftList[0].tokens[0].is_selected
    }
    //in your component
    // https://trader.xyz/images/missing-img-lg.png
    const child = (
        <img alt="no-image" src="https://trader.xyz/images/missing-img-lg.png" style={{ width: 100, height: 100 }} />
    )
    return (
        <Fade in key={nodeId}>
            <div
                key={nodeId}
                style={{
                    width: '100px',
                    border: '0px solid green',
                }}
                className={clsx(className, classes.root, {
                    [classes.expanded]: expanded,
                    [classes.selected]: selected,
                    [classes.focused]: focused,
                    [classes.disabled]: disabled,
                })}
                onMouseDown={handleMouseDown}
                onClick={(event) => handleSelectionClick(event, nftData?.collection_index, nftData?.item_index)}
                ref={ref as React.Ref<HTMLDivElement>}>
                <Grid container direction="column" justifyContent="center" alignItems="center">
                    <Grid item>
                        <Avatar
                            alt={label}
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: 10,
                                position: 'relative',
                                right: '0px',
                                border: '0px solid purple',
                                float: 'left',
                                display: 'block',
                            }}
                            children={child}
                            src={nftData?.image_preview_url}
                        />
                        {nftData?.is_selected == true && (
                            <div
                                style={{
                                    position: 'relative',
                                    display: 'block',
                                    right: '-65px',
                                    top: '0px',
                                    height: '32px',
                                    width: '32px',
                                }}>
                                <svg
                                    style={{
                                        position: 'absolute',
                                        display: 'block',
                                        alignItems: 'center',
                                        right: '0px',
                                        top: '0px',
                                        borderRadius: '100%',
                                        height: '32px',
                                        width: '32px',
                                        background: 'rgb(153, 255, 120)',
                                        border: '2px solid rgb(255, 255, 255)',
                                        boxShadow: 'rgb(0 0 0 / 4%) 0px 6px 40px, rgb(0 0 0 / 2%) 0px 3px 6px',
                                    }}
                                    viewBox="0 0 2 2"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <ellipse
                                        style={{
                                            fill: 'rgb(153, 255, 120)',
                                            stroke: '0px rgb(255,255,255)',
                                        }}
                                        cx="1.026"
                                        cy="0.979"
                                        rx="0.899"
                                        ry="0.899"
                                    />
                                    <path
                                        fill="#000"
                                        d="M 0.521 0.988 L 0.623 0.881 L 0.827 1.035 C 1.004 0.838 1.234 0.697 1.489 0.627 L 1.54 0.729 C 1.54 0.729 1.053 0.932 0.818 1.37 L 0.521 0.988 Z"
                                    />
                                </svg>
                            </div>
                        )}
                    </Grid>
                    <Grid item>
                        <Typography
                            style={{
                                width: '100px',
                                border: '0px solid red',
                                float: 'left',
                                display: 'block',
                                color: 'white',
                            }}
                            component="div"
                            className={classes.label}>
                            {label}
                        </Typography>
                    </Grid>
                </Grid>
            </div>
        </Fade>
    )
})

export default TreeChildItemContent
