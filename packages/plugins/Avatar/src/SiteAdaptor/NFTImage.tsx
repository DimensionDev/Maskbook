import { memo } from 'react'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Tooltip } from '@mui/material'
import { Image } from '@masknet/shared'
import { useWeb3Utils } from '@masknet/web3-hooks-base'
import type { AllChainsNonFungibleToken } from '../types.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        width: 100,
        height: 100,
        border: '1px solid transparent',
        boxSizing: 'border-box',
        borderRadius: 8,
    },
    icon: {
        position: 'absolute',
        top: 5,
        right: 5,
        color: theme.palette.maskColor.primary,
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        boxSizing: 'border-box',
        borderRadius: 8,
    },
    selected: {
        borderColor: theme.palette.maskColor.primary,
    },
    imageLoading: {
        color: theme.palette.maskColor.main,
        height: '20px !important',
        width: '20px !important',
    },
    imageContainer: {
        background:
            theme.palette.mode === 'dark' ?
                'linear-gradient(180deg, #202020 0%, #181818 100%)'
            :   'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)',
        borderRadius: 8,
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
    },
    tooltip: {
        whiteSpace: 'nowrap',
        maxWidth: '100%',
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
    const Utils = useWeb3Utils()
    const name = token.collection?.name || token.contract?.name
    const uiTokenId = token.tokenId ? (Utils.formatTokenId(token.tokenId, 4) ?? `#${token.tokenId}`) : name
    const title = name ? `${name} ${uiTokenId}` : (token.metadata?.name ?? '')

    return (
        <Tooltip
            title={title}
            arrow
            classes={{ tooltip: classes.tooltip }}
            disableInteractive
            placement="top"
            PopperProps={{ disablePortal: true, popperOptions: { strategy: 'absolute' } }}>
            <Box
                className={cx(classes.root, className, selected ? classes.selected : '')}
                onClick={() => onSelect(token)}>
                <Image
                    fallback={<Icons.MaskAvatar size={30} />}
                    classes={{
                        imageLoading: classes.imageLoading,
                        container: classes.imageContainer,
                    }}
                    src={token.metadata?.imageURL ?? ''}
                    className={classes.image}
                />
                {selected ?
                    <Icons.CheckCircle className={classes.icon} size={24} />
                :   null}
            </Box>
        </Tooltip>
    )
})
