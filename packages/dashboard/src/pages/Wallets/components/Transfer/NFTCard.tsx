import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { memo, useMemo, useState } from 'react'
import { Checkbox, ImageListItem, ImageListItemBar, Box } from '@mui/material'
import { getMaskColor, makeStyles, MaskColorVar } from '@masknet/theme'
import { CheckedBorderIcon, CheckedIcon } from '@masknet/icons'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'

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
    wrapper: {
        borderTopRightRadius: '12px',
        borderTopLeftRadius: '12px',
        width: '140px !important',
        height: '186px !important',
    },
    loadingPlaceholder: {
        width: '140px !important',
        height: '186px !important',
    },
    loadingFailImage: {
        minHeight: '0px !important',
        maxWidth: 'none',
        transform: 'translateY(10px)',
        width: 64,
        height: 64,
    },
})

export interface NFTCardProps {
    token: ERC721TokenDetailed
    selectedTokenId: string
    onSelect(tokenId: string): void
}

export const NFTCard = memo<NFTCardProps>(({ token, selectedTokenId, onSelect }) => {
    const { classes } = useStyles()
    const [checked, setChecked] = useState(!!selectedTokenId && selectedTokenId === token.tokenId)
    const [name, setName] = useState(token.tokenId)
    const isDisabled = useMemo(
        () => !!selectedTokenId && selectedTokenId !== token.tokenId,
        [selectedTokenId, token.tokenId],
    )

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
                subtitle={<span>{name}</span>}
                position="below"
            />
        )
    }, [name])

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
            <NFTCardStyledAssetPlayer
                contractAddress={token.contractDetailed.address}
                chainId={token.contractDetailed.chainId}
                tokenId={token.tokenId}
                setERC721TokenName={setName}
                classes={{
                    loadingFailImage: classes.loadingFailImage,
                    loadingPlaceholder: classes.loadingPlaceholder,
                    wrapper: classes.wrapper,
                }}
            />
            {NFTNameBar}
            <Box className={classes.checkbox}>
                <Checkbox
                    defaultChecked={selectedTokenId === token.tokenId}
                    value={checked}
                    size="small"
                    disabled={isDisabled}
                    icon={<CheckedBorderIcon sx={{ fontSize: '18px', stroke: '#D0D4DD' }} />}
                    checkedIcon={<CheckedIcon sx={{ fontSize: '18px' }} />}
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
