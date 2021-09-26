import type { ERC721TokenDetailed } from '@masknet/web3-shared'
import { memo, useState } from 'react'
import { Checkbox, ImageListItem, ImageListItemBar } from '@material-ui/core'
import { Box } from '@mui/system'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { MiniMaskIcon } from '@masknet/icons'

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
        borderRadius: 8,
        width: 140,
        height: 215,
        backgroundColor: MaskColorVar.lightBackground,
        display: 'flex',
        flexDirection: 'column',
    },
    placeholder: {
        width: '100%',
        height: 186,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    description: {
        flex: 1,
        backgroundColor: MaskColorVar.infoBackground,
    },
})
export interface NFTCardProps {
    token: ERC721TokenDetailed
    selected: string
    onSelect(tokenId: string): void
}

export const NFTCard = memo<NFTCardProps>(({ token, selected, onSelect }) => {
    const { classes } = useStyles()
    const [loadFailed, setLoadFailed] = useState(false)
    const [checked, setChecked] = useState(!!selected && selected === token.tokenId)

    return (
        <ImageListItem sx={{ height: 186, width: 144, mb: 4 }}>
            {loadFailed || !token.info.image ? (
                <div className={classes.container}>
                    <div className={classes.placeholder}>
                        <MiniMaskIcon viewBox="0 0 48 48" sx={{ fontSize: 48, opacity: 0.5 }} />
                    </div>
                    <div className={classes.description} />
                </div>
            ) : (
                <>
                    <img
                        onError={() => setLoadFailed(true)}
                        src={token.info.image}
                        style={{ width: '100%', height: '100%', borderRadius: '8px 8px 0px 0px', objectFit: 'cover' }}
                    />
                    <ImageListItemBar sx={{ py: 1 }} subtitle={<span>{token.info.name}</span>} position="below" />
                </>
            )}
            {(selected === '' || (!!selected && selected === token.tokenId)) && (
                <Box className={classes.checkbox}>
                    <Checkbox
                        value={checked}
                        size="small"
                        onChange={(e) => {
                            const value = e.target.checked
                            onSelect(value ? token.tokenId : '')
                            setChecked(value)
                        }}
                    />
                </Box>
            )}
        </ImageListItem>
    )
})
