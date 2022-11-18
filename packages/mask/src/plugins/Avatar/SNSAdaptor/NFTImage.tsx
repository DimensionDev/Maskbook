import { Icons } from '@masknet/icons'
import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { Box, Tooltip } from '@mui/material'
import { memo } from 'react'
import type { AllChainsNonFungibleToken } from '../types.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    icon: {
        position: 'absolute',
        top: 5,
        right: 5,
        color: theme.palette.maskColor.primary,
    },
    image: {
        width: 100,
        height: 100,
        objectFit: 'cover',
        boxSizing: 'border-box',
        borderRadius: 8,
        border: '1px solid transparent',
    },
    selected: {
        border: `1px solid ${theme.palette.maskColor.primary}`,
        borderRadius: 8,
    },
    imageLoading: {
        color: theme.palette.maskColor.main,
        height: '20px !important',
        width: '20px !important',
    },
    imageLoadingBox: {
        background:
            theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, #202020 0%, #181818 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)',
        borderRadius: 8,
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
    },
    tooltip: {
        whiteSpace: 'nowrap',
    },
}))

interface NFTImageProps {
    className?: string
    token: AllChainsNonFungibleToken
    selected?: boolean
    onSelect: (token: AllChainsNonFungibleToken) => void
}

export const NFTImage = memo((props: NFTImageProps) => {
    const { className, token, onSelect, selected } = props
    const { classes, cx } = useStyles()
    const { Others } = useWeb3State()
    const name = token.collection?.name || token.contract?.name
    const uiTokenId = Others?.formatTokenId(token.tokenId, 4) ?? `#${token.tokenId}`
    const title = name ? `${name} ${uiTokenId}` : token.metadata?.name ?? ''

    return (
        <Tooltip
            title={title}
            arrow
            classes={{ tooltip: classes.tooltip }}
            disableInteractive
            placement="top"
            PopperProps={{ disablePortal: true, popperOptions: { strategy: 'absolute' } }}>
            <Box className={cx(classes.root, className)}>
                <Image
                    fallback={<Icons.MaskAvatar size={100} />}
                    classes={{
                        imageLoading: classes.imageLoading,
                        container: classes.imageLoadingBox,
                    }}
                    onClick={() => onSelect(token)}
                    src={token.metadata?.imageURL ?? ''}
                    className={cx(classes.image, selected ? classes.selected : '')}
                />
                {selected ? <Icons.CheckCircle className={classes.icon} size={24} /> : null}
            </Box>
        </Tooltip>
    )
})
