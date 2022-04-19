// /* eslint-disable no-restricted-imports */
// /* eslint-disable spaced-comment */
// /* eslint-disable eqeqeq */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import { makeStyles } from '@masknet/theme'
import TreeView from '@mui/lab/TreeView'
import { AddCircle, RemoveCircle } from '@mui/icons-material'
import type { PreviewNftList, TreeNftData } from '../../types'

import TreeParentContent from './TreeParentContent'
import TreeChildContent from './TreeChildContent'
import TreeChildItemContent from './TreeChildItemContent'

import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem'
import { alpha, styled } from '@mui/material/styles'

const useStyles = makeStyles()(() => {
    return {
        wrapper: {
            color: 'black',
            height: 128,
            margin: 10,
            border: '0x solid blue',
            width: 'auto',
            float: 'left',
        },
        label: {
            color: 'black',
            paddingLeft: '20px',
        },
    }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NftListView = (props: {
    nftList: PreviewNftList[] | null | undefined
    handleSelection(collection_index: number, item_index: number, type: string): void
}): JSX.Element => {
    const { classes } = useStyles()
    const myComponentStyle1 = {
        color: 'white',
        border: '0px solid blue',
        display: 'block',
    }

    const previewImages: string[] | null | undefined = props?.nftList
        ?.map((x) => x?.tokens)
        .flat()
        .map((y) => {
            return y?.image_preview_url
        })
        .slice(0, 3)

    const CustomTreeParent = styled(
        (props: TreeItemProps & { ContentProps?: { previewImages: string[] | null | undefined } }) => (
            <TreeItem {...props} ContentComponent={TreeParentContent} />
        ),
    )(({ theme }) => ({
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

    const CustomTreeChild = styled((props: TreeItemProps & { ContentProps?: { collectionImage: string } }) => (
        <TreeItem {...props} ContentComponent={TreeChildContent} />
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

    const CustomTreeChildItem = styled(
        (
            props: TreeItemProps & {
                ContentProps?: {
                    // nftData?: TreeNftData
                    // handleSelection(collection_index: number, item_index: number): void
                    nftData?: TreeNftData
                    handleSelection?(collection_index: number, item_index: number, type: string): void
                }
                className: string
            },
        ) => <TreeItem {...props} className={props.className} ContentComponent={TreeChildItemContent} />,
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

    const collectionItemList = props?.nftList?.map((item, index) => {
        const collectionImage = 'item?.tokens?item.tokens[0]?.image_preview_url'
        return (
            <CustomTreeChild
                nodeId={'p-' + index}
                key={'p-' + index}
                style={myComponentStyle1}
                label={item.collection_name}
                ContentProps={{ collectionImage: collectionImage }}>
                {item?.tokens?.map((item, i) => (
                    <CustomTreeChildItem
                        className={classes.wrapper}
                        classes={{ label: classes.label }}
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
            </CustomTreeChild>
        )
    })

    return (
        <TreeView
            aria-label="icon expansion"
            defaultCollapseIcon={<RemoveCircle style={{ fontSize: '35px' }} />}
            defaultExpandIcon={<AddCircle style={{ fontSize: '35px' }} />}
            multiSelect
            sx={{ height: 'auto', flexGrow: 1, maxWidth: '100%' }}>
            <CustomTreeParent
                nodeId="mp0"
                key="mp0"
                label="Collectibles & NFTs3"
                ContentProps={{ previewImages: previewImages }}>
                {collectionItemList}
            </CustomTreeParent>
        </TreeView>
    )
}

export default NftListView
