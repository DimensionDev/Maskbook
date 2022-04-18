/* eslint-disable no-restricted-imports */
/* eslint-disable spaced-comment */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeStyles } from '@masknet/theme'
import TreeView from '@mui/lab/TreeView'
import * as React from 'react'
import { CustomTreeChild, CustomTreeChildItem, CustomTreeParent } from './NftListTree'
import { AddCircle, RemoveCircle } from '@mui/icons-material'

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

const NftListView = (props: { nftList: any[]; handleSelection: any }): JSX.Element => {
    const { classes } = useStyles()
    const myComponentStyle1 = {
        color: 'white',
        border: '0px solid blue',
        display: 'block',
    }

    const previewImages = props?.nftList
        .map((x: { tokens: any }) => x.tokens)
        .flat()
        .map((y) => {
            return y.image_preview_url
        })
        .slice(0, 3)

    const collectionItemList = props?.nftList.map((item: any, index: any) => {
        return (
            <CustomTreeChild
                nodeId={'p-' + index}
                key={'p-' + index}
                style={myComponentStyle1}
                label={item.collection_name}
                ContentProps={{ collectionImage: item.tokens[0].image_preview_url }}>
                {item.tokens.map((item: any, i: any) => (
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
                                image_exist: item.image_exist,
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
                label="Collectibles & NFTs"
                ContentProps={{ previewImages: previewImages }}>
                {collectionItemList}
            </CustomTreeParent>
        </TreeView>
    )
}

export default NftListView
