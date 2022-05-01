import { makeStyles } from '@masknet/theme'
import TreeView from '@mui/lab/TreeView'
import { AddCircle, RemoveCircle } from '@mui/icons-material'
import type { PreviewNftList, TreeNftData } from '../../types'

import TreeParentContent from './TreeParentContent'
import TreeChildContent from './TreeChildContent'
import TreeChildItemContent from './TreeChildItemContent'

import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem'
import { alpha, styled } from '@mui/material/styles'
import { useI18N } from '../../locales/i18n_generated'
import { useMemo } from 'react'

const useStyles = makeStyles()((theme) => {
    return {
        label: {
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            paddingLeft: '20px !important',
        },
    }
})

const NftListView = (props: {
    nftList: PreviewNftList[] | null | undefined
    handleSelection(collection_index: number, item_index: number, type: string): void
}): JSX.Element => {
    const { classes } = useStyles()
    const t = useI18N()

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

    const CustomTreeChild = styled(
        (props: TreeItemProps & { ContentProps?: { collectionImage: string | undefined } }) => (
            <TreeItem {...props} ContentComponent={TreeChildContent} />
        ),
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

    const CustomTreeChildItem = styled(
        (
            props: TreeItemProps & {
                ContentProps?: {
                    nftData?: TreeNftData | undefined
                    onSelected?(collectionIndex: number, itemIndex: number, type?: string): void
                }
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
        const collectionImage = item.tokens[0].image_preview_url
        return (
            <CustomTreeChild
                nodeId={'p-' + index}
                key={'p-' + index}
                classes={{ label: classes.label }}
                label={item.collection_name}
                ContentProps={{ collectionImage }}>
                {item?.tokens?.map((item, i) => (
                    <CustomTreeChildItem
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
                            onSelected: props.handleSelection,
                        }}
                    />
                ))}
            </CustomTreeChild>
        )
    })

    const nftList = props?.nftList
    const previewImages1 = useMemo(() => {
        return nftList
            ?.map((x) => x?.tokens)
            .flat()
            .slice(0, 3)
            .map((y) => {
                return y?.image_preview_url
            })
    }, [nftList])

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
                label={t.nft_tree_parent_title()}
                ContentProps={{ previewImages: previewImages1 }}>
                {collectionItemList}
            </CustomTreeParent>
        </TreeView>
    )
}

export default NftListView
