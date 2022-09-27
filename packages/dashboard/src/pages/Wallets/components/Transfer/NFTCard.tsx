import { memo } from 'react'
import { Checkbox, ImageListItem, ImageListItemBar, Box } from '@mui/material'
import { getMaskColor, makeStyles, MaskColorVar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { AssetPreviewer } from '@masknet/shared'
import type { NonFungibleAsset } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()({
    card: {
        position: 'relative',
    },
    checkbox: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
    container: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        height: '100%',
        backgroundColor: MaskColorVar.lineLight,
        display: 'flex',
        flexDirection: 'column',
    },
    placeholder: {
        width: '100%',
        height: 200,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    description: {
        flex: 1,
    },
    disabled: {
        filter: 'opacity(0.5)',
        cursor: 'not-allowed',
    },
    barTitle: {
        padding: 0,
        lineHeight: '16px',
    },
    fallbackImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        transform: 'translateY(10px)',
        width: 64,
        height: 64,
    },
})

export interface NFTCardProps {
    asset: NonFungibleAsset<ChainId, SchemaType>
    selected: boolean
    onSelect(tokenId: string): void
}

export const NFTCard = memo<NFTCardProps>(({ asset, selected, onSelect }) => {
    const { classes } = useStyles()
    const pluginID = useCurrentWeb3NetworkPluginID()

    return (
        <ImageListItem
            sx={{
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px',
                mb: 6,
                maxWidth: '140px',
                background: (theme) => (theme.palette.mode === 'dark' ? getMaskColor(theme).white : '#F9F9FA'),
            }}
            className={!selected ? classes.disabled : ''}>
            <AssetPreviewer
                classes={{
                    fallbackImage: classes.fallbackImage,
                }}
                pluginID={pluginID}
                chainId={asset.chainId}
                url={asset.metadata?.imageURL ?? asset.metadata?.mediaURL}
            />
            <ImageListItemBar
                sx={{
                    px: 1,
                    py: 1.5,
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    background: (theme) => (theme.palette.mode === 'dark' ? MaskColorVar.primaryBackground : '#F9F9FA'),
                }}
                classes={{ titleWrap: classes.barTitle }}
                subtitle={<span>{asset.metadata?.name ?? ''}</span>}
                position="below"
            />
            <Box className={classes.checkbox}>
                {/* TODO: replace to mask checkbox component */}
                <Checkbox
                    defaultChecked={selected}
                    value={selected}
                    size="small"
                    disabled={!selected}
                    icon={<Icons.CheckboxBorder size={18} color="#D0D4DD" />}
                    checkedIcon={<Icons.Checkbox size={18} color="#1C68F3" />}
                    onChange={(e) => {
                        const value = e.target.checked
                        onSelect(value ? asset.tokenId : '')
                    }}
                />
            </Box>
        </ImageListItem>
    )
})
