import { makeStyles } from '@masknet/theme'
import {
    ERC721TokenDetailed,
    SocketState,
    useChainId,
    useCollectibles,
    useImageChecker,
} from '@masknet/web3-shared-evm'
import { Box, Button, Skeleton, Typography } from '@mui/material'
import { uniqBy } from 'lodash-unified'
import { useState } from 'react'
import { useI18N } from '../../../utils'
import { NFTImage } from './NFTImage'

const useStyles = makeStyles()((theme) => ({
    root: {},
    skeleton: {
        width: 97,
        height: 97,
        objectFit: 'cover',
        borderRadius: '100%',
        boxSizing: 'border-box',
        padding: 6,
        margin: theme.spacing(0.5, 1),
    },
    skeletonBox: {
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    error: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
    },
    button: {
        textAlign: 'center',
        paddingTop: theme.spacing(1),
        display: 'flex',
        justifyContent: 'space-around',
        flexDirection: 'row',
    },
    gallery: {
        display: 'flex',
        flexFlow: 'row wrap',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        justifyContent: 'space-between',
    },
}))
interface NFTListProps {
    address: string
    onSelect: (token?: ERC721TokenDetailed) => void
}

export function NFTList(props: NFTListProps) {
    const { classes } = useStyles()
    const { address, onSelect } = props
    const chainId = useChainId()
    const { t } = useI18N()
    const { data: collectibles, error, retry, state } = useCollectibles(address, chainId)
    const [selectedToken, setSelectedToken] = useState<ERC721TokenDetailed | undefined>()

    const onChange = (token?: ERC721TokenDetailed) => {
        setSelectedToken(token)
        onSelect(token)
    }

    const LoadStatus = Array.from({ length: 8 })
        .fill(0)
        .map((_, i) => (
            <div key={i} className={classes.skeletonBox}>
                <Skeleton animation="wave" variant="rectangular" className={classes.skeleton} />
            </div>
        ))
    const Retry = (
        <Box className={classes.error}>
            <Typography color="textSecondary">{t('dashboard_no_collectible_found')}</Typography>
            <Button className={classes.button} variant="text" onClick={retry}>
                {t('plugin_collectible_retry')}
            </Button>
        </Box>
    )
    return (
        <>
            <Box className={classes.root}>
                <Box className={classes.gallery}>
                    {state !== SocketState.done && collectibles.length === 0
                        ? LoadStatus
                        : error || collectibles.length === 0
                        ? Retry
                        : uniqBy(collectibles, (x) => x.contractDetailed.address && x.tokenId).map(
                              (token: ERC721TokenDetailed, i) => (
                                  <NFTImageCollectibleAvatar
                                      key={i}
                                      token={token}
                                      selectedToken={selectedToken}
                                      onChange={(token) => onChange(token)}
                                  />
                              ),
                          )}
                </Box>
            </Box>
        </>
    )
}

interface NFTImageCollectibleAvatarProps {
    token: ERC721TokenDetailed
    onChange: (token: ERC721TokenDetailed | undefined) => void
    selectedToken?: ERC721TokenDetailed
}

function NFTImageCollectibleAvatar({ token, onChange, selectedToken }: NFTImageCollectibleAvatarProps) {
    const { classes } = useStyles()
    const { value: isImageToken, loading } = useImageChecker(token.info?.imageURL)
    if (loading)
        return (
            <div className={classes.skeletonBox}>
                <Skeleton animation="wave" variant="rectangular" className={classes.skeleton} />
            </div>
        )
    return isImageToken ? <NFTImage token={token} selectedToken={selectedToken} onChange={onChange} /> : null
}
