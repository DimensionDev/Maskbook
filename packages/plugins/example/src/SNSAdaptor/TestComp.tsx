import * as React from 'react'
import TreeView from '@mui/lab/TreeView'
import AddCircle from '@mui/icons-material/AddCircle'
import RemoveCircle from '@mui/icons-material/RemoveCircle'
import TreeItem, { TreeItemProps, useTreeItem, treeItemClasses, TreeItemContentProps } from '@mui/lab/TreeItem'
import clsx from 'clsx'
import Typography from '@mui/material/Typography'
import { alpha, styled } from '@mui/material/styles'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import { makeStyles } from '@masknet/theme'
///Temp
const useStyles = makeStyles()(() => {
    return {
        wrapper: {
            color: 'black',
            height: 162,
            margin: 10,
            border: '0x solid blue',
            width: 'auto',
            float: 'left',
        },
    }
})

const TestComp = (props: { nftList: any[]; handleSelection: any }): JSX.Element => {
    const { classes } = useStyles()

    const CustomParentContent = React.forwardRef(function CustomContent(
        props: TreeItemContentProps & {
            previewImages?: any
        },
        ref,
    ) {
        const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon, previewImages } = props

        const { disabled, expanded, selected, focused, handleExpansion, handleSelection, preventSelection } =
            useTreeItem(nodeId)

        const icon = iconProp || expansionIcon || displayIcon

        const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            preventSelection(event)
        }

        const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            handleExpansion(event)
            console.log('expanded', expanded)
        }

        const handleSelectionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            console.log('expanded', expanded)

            handleSelection(event)
        }

        const getNftPrevewPositon = function (index: number) {
            switch (index) {
                case 1:
                    return '-20px'
                case 2:
                    return '-10px'
                default:
                    return '0px'
            }
        }

        const ShowNft = previewImages?.map((item: any, index: any) => {
            return (
                <img
                    key={`pimage-${index}`}
                    alt="1"
                    style={{
                        width: '32px',
                        borderRadius: 99,
                        position: 'relative',
                        right: getNftPrevewPositon(index),
                        float: 'left',
                        border: '1px solid white',
                    }}
                    src={item}
                />
            )
        })

        return (
            <div
                key={nodeId}
                className={clsx(className, classes.root, {
                    [classes.expanded]: expanded,
                    [classes.selected]: selected,
                    [classes.focused]: focused,
                    [classes.disabled]: disabled,
                })}
                onMouseDown={handleMouseDown}
                ref={ref as React.Ref<HTMLDivElement>}>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
                <div onClick={handleExpansionClick} className={classes.iconContainer}>
                    {icon}
                </div>
                <Typography onClick={handleSelectionClick} component="div" className={classes.label}>
                    {label}
                </Typography>
                <Fade in={!expanded}>
                    <div key={`d-${nodeId}`} style={{ width: '150px', border: '0px solid black' }}>
                        {ShowNft}
                    </div>
                </Fade>
            </div>
        )
    })

    const CustomContentContent = React.forwardRef(function CustomContent(
        props: TreeItemContentProps & {
            collectionImage?: any
        },
        ref,
    ) {
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

        return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
                key={nodeId}
                style={{ paddingTop: '10px' }}
                className={clsx(className, classes.root, {
                    [classes.expanded]: expanded,
                    [classes.selected]: selected,
                    [classes.focused]: focused,
                    [classes.disabled]: disabled,
                })}
                onClick={handleExpansionClick}
                onMouseDown={handleMouseDown}
                ref={ref as React.Ref<HTMLDivElement>}>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
                <div className={classes.iconContainer}>
                    {collectionImage == 'https://trader.xyz/images/missing-img-lg.png' ? (
                        <>{icon}</>
                    ) : (
                        <img
                            src={collectionImage}
                            onErrorCapture={(e) => {
                                ///alert('image not found ')
                                //e.target.src = 'https://trader.xyz/images/missing-img-lg.png'
                            }}
                            alt="1"
                            style={{
                                width: '32px',
                                borderRadius: 99,
                                position: 'relative',
                                right: '0px',
                                border: '1px solid white',
                            }}
                        />
                    )}
                </div>
                <Typography
                    onClick={handleSelectionClick}
                    component="div"
                    className={classes.label}
                    style={{ paddingLeft: '20px' }}>
                    {label}
                </Typography>
            </div>
        )
    })

    const CustomContentChildContent = React.forwardRef(function CustomContent(
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

        return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <Fade in={true} key={nodeId}>
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
                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}

                    <Grid container direction="column" justifyContent="center" alignItems="center">
                        <Grid item>
                            image=
                            <img
                                alt={classes.label}
                                style={{
                                    width: '100px',
                                    borderRadius: 10,
                                    position: 'relative',
                                    right: '0px',
                                    border: '0px solid purple',
                                    float: 'left',
                                    display: 'block',
                                }}
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
                                            ry="0.899"></ellipse>
                                        <path
                                            fill="#000"
                                            d="M 0.521 0.988 L 0.623 0.881 L 0.827 1.035 C 1.004 0.838 1.234 0.697 1.489 0.627 L 1.54 0.729 C 1.54 0.729 1.053 0.932 0.818 1.37 L 0.521 0.988 Z"></path>
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

    const CustomTreeParent = styled((props: TreeItemProps & { ContentProps?: { previewImages: any } }) => (
        <TreeItem {...props} ContentComponent={CustomParentContent} />
    ))(({ theme }) => ({
        [`& .${treeItemClasses.label}`]: {
            paddingLeft: 15,
        },
        [`& .${treeItemClasses.iconContainer}`]: {
            '& .close': {
                opacity: 0.3,
            },
        },
        [`& .${treeItemClasses.group}`]: {
            marginLeft: 15,
            paddingLeft: 18,
            borderLeft: `1px solid ${alpha(theme.palette.text.primary, 0.4)}`,
        },
    }))

    const CustomTreeItem = styled((props: TreeItemProps & { ContentProps?: { collectionImage: any } }) => (
        <TreeItem {...props} ContentComponent={CustomContentContent} />
    ))(({ theme }) => ({
        [`& .${treeItemClasses.iconContainer}`]: {
            '& .close': {
                opacity: 0.3,
            },
        },
        [`& .${treeItemClasses.group}`]: {
            marginLeft: 15,
            paddingLeft: 18,
            borderLeft: `1px solid ${alpha(theme.palette.text.primary, 0.4)}`,
        },
    }))

    const CustomTreeItemChild = styled(
        (
            props: TreeItemProps & {
                ContentProps?: {
                    nftData?: {
                        id: any
                        image_preview_url: any
                        token_id: any
                        is_selected: any
                        collection_index: number
                        item_index: number
                    }
                    handleSelection: any
                }
            },
        ) => <TreeItem {...props} className={classes.wrapper} ContentComponent={CustomContentChildContent} />,
    )(({ theme }) => ({
        [`& .${treeItemClasses.iconContainer}`]: {
            '& .close': {
                opacity: 0.3,
            },
        },
        [`& .${treeItemClasses.group}`]: {
            marginLeft: 15,
            paddingLeft: 18,
            borderLeft: `1px solid ${alpha(theme.palette.text.primary, 0.4)}`,
        },
    }))
    const myComponentStyle1 = {
        color: 'white',
        border: '0px solid blue',
        display: 'block',
    }
    //pending
    //2-set alt pictures
    //Next
    // Submit order
    const collectionItemList = props?.nftList.map((item: any, index: any) => {
        return (
            <CustomTreeItem
                nodeId={'p-' + index}
                key={'p-' + index}
                style={myComponentStyle1}
                label={item.collection_name}
                ContentProps={{ collectionImage: item.tokens[0].image_preview_url }}>
                {item.tokens.map((item: any, i: any) => (
                    <CustomTreeItemChild
                        nodeId={'p-' + index + 'c-' + i}
                        key={'p-' + index + 'c-' + i}
                        label={item.name}
                        ContentProps={{
                            nftData: {
                                id: item.id,
                                image_preview_url: item.image_preview_url,
                                token_id: item.token_id,
                                is_selected: item.is_selected,
                                collection_index: index,
                                item_index: i,
                            },
                            handleSelection: props.handleSelection,
                        }}
                    />
                ))}
            </CustomTreeItem>
        )
    })

    const previewImages = props?.nftList
        .map((x: { tokens: any }) => x.tokens)
        .flat()
        .map((y) => {
            return y.image_preview_url
        })
        .slice(0, 3)

    return (
        <TreeView
            aria-label="icon expansion"
            defaultCollapseIcon={<RemoveCircle style={{ fontSize: '35px' }} />}
            defaultExpandIcon={<AddCircle style={{ fontSize: '35px' }} />}
            multiSelect
            sx={{ height: 'auto', flexGrow: 1, maxWidth: '100%' }}>
            <CustomTreeParent
                nodeId="mp0"
                key={'mp0'}
                label="Collectibles & NFTs"
                ContentProps={{ previewImages: previewImages }}>
                {collectionItemList}
            </CustomTreeParent>
        </TreeView>
    )
}

export default TestComp
