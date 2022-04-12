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
const { classes } = useStyles()

const CustomParentContent = React.forwardRef(function CustomContent(props: TreeItemContentProps, ref) {
    const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon } = props

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

    const ShowNft: any = () => {
        return (
            <>
                <img
                    alt="1"
                    style={{
                        width: '32px',
                        borderRadius: 99,
                        position: 'relative',
                        right: '-20px',
                        float: 'left',
                        border: '1px solid white',
                    }}
                    src="https://lh3.googleusercontent.com/EkUOxyNqiZNyneAu6gph-R9cEIbLROq55e6NCTCfn1kygnUqoIuqJ4lIptu7-BWunKa0jK4cVyyem42gLRmwLBt3rH_xaCoHXsyz"
                />
                <img
                    alt="2"
                    style={{
                        width: '32px',
                        borderRadius: 99,
                        position: 'relative',
                        right: '-10px',
                        float: 'left',
                        border: '1px solid white',
                    }}
                    src="https://lh3.googleusercontent.com/EkUOxyNqiZNyneAu6gph-R9cEIbLROq55e6NCTCfn1kygnUqoIuqJ4lIptu7-BWunKa0jK4cVyyem42gLRmwLBt3rH_xaCoHXsyz"
                />
                <img
                    alt="3"
                    style={{
                        width: '32px',
                        borderRadius: 99,
                        position: 'relative',
                        right: '0px',
                        float: 'left',
                        border: '1px solid white',
                    }}
                    src="https://lh3.googleusercontent.com/EkUOxyNqiZNyneAu6gph-R9cEIbLROq55e6NCTCfn1kygnUqoIuqJ4lIptu7-BWunKa0jK4cVyyem42gLRmwLBt3rH_xaCoHXsyz"
                />
            </>
        )
    }

    return (
        <div
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
                <div style={{ width: '150px', border: '0px solid black' }}>
                    <ShowNft />
                </div>
            </Fade>
        </div>
    )
})

const CustomContent = React.forwardRef(function CustomContent(props: TreeItemContentProps, ref) {
    const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon } = props

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
            <img
                alt="1"
                style={{
                    width: '32px',
                    borderRadius: 99,
                    position: 'relative',
                    right: '0px',
                    border: '1px solid white',
                }}
                src="https://lh3.googleusercontent.com/EkUOxyNqiZNyneAu6gph-R9cEIbLROq55e6NCTCfn1kygnUqoIuqJ4lIptu7-BWunKa0jK4cVyyem42gLRmwLBt3rH_xaCoHXsyz"
            />
            <Typography onClick={handleSelectionClick} component="div" className={classes.label}>
                {label}
            </Typography>
        </div>
    )
})

const CustomContentChild = React.forwardRef(function CustomContent(props: TreeItemContentProps, ref) {
    const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon } = props

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
        <Fade in={true}>
            <div
                style={{
                    width: '132px',
                    border: '0px solid green',
                }}
                className={clsx(className, classes.root, {
                    [classes.expanded]: expanded,
                    [classes.selected]: selected,
                    [classes.focused]: focused,
                    [classes.disabled]: disabled,
                })}
                onMouseDown={handleMouseDown}
                ref={ref as React.Ref<HTMLDivElement>}>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}

                <Grid container direction="column" justifyContent="center" alignItems="center">
                    <Grid item>
                        <img
                            alt="1"
                            style={{
                                width: '132px',
                                borderRadius: 10,
                                position: 'relative',
                                right: '0px',
                                border: '0px solid purple',
                                float: 'left',
                                display: 'block',
                            }}
                            src="https://lh3.googleusercontent.com/EkUOxyNqiZNyneAu6gph-R9cEIbLROq55e6NCTCfn1kygnUqoIuqJ4lIptu7-BWunKa0jK4cVyyem42gLRmwLBt3rH_xaCoHXsyz"
                        />
                    </Grid>
                    <Grid item>
                        <Typography
                            style={{
                                width: '132px',
                                border: '0px solid red',
                                float: 'left',
                                display: 'block',
                            }}
                            onClick={handleSelectionClick}
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

const StyledTreeItem = styled((props: TreeItemProps) => <TreeItem {...props} ContentComponent={CustomParentContent} />)(
    ({ theme }) => ({
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
    }),
)

const CustomParentTreeItem = styled((props: TreeItemProps) => (
    <TreeItem {...props} ContentComponent={CustomParentContent} />
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

const CustomTreeItem = styled((props: TreeItemProps) => <TreeItem {...props} ContentComponent={CustomContent} />)(
    ({ theme }) => ({
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
    }),
)

const CustomTreeItemChild = styled((props: TreeItemProps) => (
    <TreeItem {...props} className={classes.wrapper} ContentComponent={CustomContentChild} />
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
const myComponentStyle1 = {
    color: 'black',
    border: '0px solid blue',
    display: 'block',
}
export default function IconExpansionTreeView() {
    return (
        <TreeView
            aria-label="icon expansion"
            defaultCollapseIcon={<RemoveCircle />}
            defaultExpandIcon={<AddCircle />}
            sx={{ height: 'auto', flexGrow: 1, maxWidth: '100%' }}>
            <StyledTreeItem nodeId="1" label="Collectibles & NFTs">
                <CustomTreeItem nodeId="2" style={myComponentStyle1} label="Meo Cat3">
                    <CustomTreeItemChild nodeId="18" label="1" />
                    <CustomTreeItemChild nodeId="18" label="2" />
                    <CustomTreeItemChild nodeId="18" label="3" />
                </CustomTreeItem>
                <CustomTreeItem nodeId="3" label="Meo Cat2" />
                <CustomTreeItem nodeId="4" label="Meo Cat1" />
            </StyledTreeItem>
            {/* <CustomParentTreeItem nodeId="5" label="Tokens">
                <CustomTreeItem nodeId="10" label="OSS" />
                <CustomTreeItem nodeId="6" label="MUI">
                    <CustomTreeItem nodeId="7" label="src">
                        <CustomTreeItemChild nodeId="8" label="index.js" />
                        <CustomTreeItemChild nodeId="9" label="tree-view.js" />
                    </CustomTreeItem>
                </CustomTreeItem>
            </CustomParentTreeItem> */}
        </TreeView>
    )
}
