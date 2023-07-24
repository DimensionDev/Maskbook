import { memo, useMemo, useState } from 'react'
import { Checkbox, ImageListItem, ImageListItemBar, Box } from '@mui/material'
import { getMaskColor, makeStyles, MaskColorVar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { AssetPreviewer } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useNonFungibleAsset } from '@masknet/web3-hooks-base'
import type { NonFungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()({
    checkbox: {
        position: 'absolute',
        top: 0,
        right: 0,
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
    token: NonFungibleToken<ChainId, SchemaType>
    selectedTokenId: string
    onSelect(tokenId: string): void
}

export const NFTCard = memo<NFTCardProps>(({ token, selectedTokenId, onSelect }) => {
    const { classes } = useStyles()
    const [checked, setChecked] = useState(!!selectedTokenId && selectedTokenId === token.tokenId)
    const isDisabled = useMemo(
        () => !!selectedTokenId && selectedTokenId !== token.tokenId,
        [selectedTokenId, token.tokenId],
    )

    const { data: NFTDetailed } = useNonFungibleAsset<'all'>(NetworkPluginID.PLUGIN_EVM, token.address, token.tokenId, {
        chainId: token.chainId,
    })

    const NFTNameBar = useMemo(() => {
        return (
            <ImageListItemBar
                sx={{
                    px: 1,
                    py: 1.5,
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    background: (theme) => (theme.palette.mode === 'dark' ? MaskColorVar.primaryBackground : '#F9F9FA'),
                }}
                classes={{ titleWrap: classes.barTitle }}
                subtitle={<span>{token.tokenId}</span>}
                position="below"
            />
        )
    }, [token.tokenId])

    return (
        <ImageListItem
            sx={{
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px',
                mb: 6,
                maxWidth: '140px',
                background: (theme) => (theme.palette.mode === 'dark' ? getMaskColor(theme).white : '#F9F9FA'),
            }}
            className={isDisabled ? classes.disabled : ''}>
            <AssetPreviewer
                classes={{
                    fallbackImage: classes.fallbackImage,
                }}
                url={NFTDetailed?.metadata?.imageURL || NFTDetailed?.metadata?.mediaURL}
            />
            {NFTNameBar}
            <Box className={classes.checkbox}>
                {/* TODO: replace to mask checkbox component */}
                <Checkbox
                    defaultChecked={selectedTokenId === token.tokenId}
                    value={checked}
                    size="small"
                    disabled={isDisabled}
                    icon={<Icons.CheckboxBorder size={18} color="#D0D4DD" />}
                    checkedIcon={<Icons.Checkbox size={18} color="#1C68F3" />}
                    onChange={(e) => {
                        const value = e.target.checked
                        onSelect(value ? token.tokenId : '')
                        setChecked(value)
                    }}
                />
            </Box>
        </ImageListItem>
    )
})
