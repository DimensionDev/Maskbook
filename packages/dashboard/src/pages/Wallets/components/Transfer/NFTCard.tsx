import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { memo, useMemo, useState } from 'react'
import { Checkbox, ImageListItem, ImageListItemBar } from '@material-ui/core'
import { Box } from '@mui/system'
import { getMaskColor, makeStyles, MaskColorVar } from '@masknet/theme'
import { MiniMaskIcon, CheckedBorderIcon, CheckedIcon } from '@masknet/icons'

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
})

export interface NFTCardProps {
    token: ERC721TokenDetailed
    selectedTokenId: string
    onSelect(tokenId: string): void
}

export const NFTCard = memo<NFTCardProps>(({ token, selectedTokenId, onSelect }) => {
    const { classes } = useStyles()
    const [loadFailed, setLoadFailed] = useState(false)
    const [checked, setChecked] = useState(!!selectedTokenId && selectedTokenId === token.tokenId)

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
                subtitle={<span>{token.info.name || token.tokenId}</span>}
                position="below"
            />
        )
    }, [token.info.name, token.tokenId])

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
            {loadFailed || !token.info.image ? (
                <div className={classes.container}>
                    <div className={classes.placeholder}>
                        <MiniMaskIcon viewBox="0 0 48 48" sx={{ fontSize: 48 }} />
                    </div>
                </div>
            ) : (
                <img
                    onError={() => setLoadFailed(true)}
                    src={token.info.image}
                    style={{ width: '100%', height: '100%', borderRadius: '8px 8px 0px 0px', objectFit: 'cover' }}
                />
            )}
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
