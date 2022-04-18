/* eslint-disable no-restricted-imports */
/* eslint-disable spaced-comment */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { alpha, styled } from '@mui/material/styles'
import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem'
import TreeChildContent from './TreeChildContent'
import TreeChildItemContent from './TreeChildItemContent'
import TreeParentContent from './TreeParentContent'

export const CustomTreeParent = styled((props: TreeItemProps & { ContentProps?: { previewImages: any } }) => (
    <TreeItem {...props} ContentComponent={TreeParentContent} />
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

export const CustomTreeChild = styled((props: TreeItemProps & { ContentProps?: { collectionImage: any } }) => (
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

export const CustomTreeChildItem = styled(
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
