import { ERC721TokenDetailed, ChainId, CollectibleProvider, resolveCollectibleLink } from '@masknet/web3-shared'
import { memo, useRef } from 'react'
import { Box, Button, Link, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'
import { CollectiblePlaceholder } from '../CollectiblePlaceHolder'
import { useHoverDirty } from 'react-use'
import { useDashboardI18N } from '../../../../locales'

const useStyles = makeStyles()((theme) => ({
    card: {
        borderRadius: 8,
        width: 140,
        minHeight: 215,
        backgroundColor: theme.palette.mode === 'dark' ? MaskColorVar.lineLight : MaskColorVar.lightestBackground,
        display: 'flex',
        flexDirection: 'column',
    },
    imgContainer: {
        width: '100%',
        height: 186,
    },
    description: {
        flex: 1,
        flexGrow: 1,
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        fontSize: 12,
    },
    hover: {
        '&:hover': {
            transform: 'scale(1.1)',
            filter: 'drop-shadow(0px 12px 28px rgba(0, 0, 0, 0.1))',
        },
    },
}))

export interface CollectibleCardProps {
    chainId: ChainId
    provider: CollectibleProvider
    token: ERC721TokenDetailed
    onSend(): void
}

export const CollectibleCard = memo<CollectibleCardProps>(({ chainId, provider, token, onSend }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const ref = useRef(null)
    const isHovering = useHoverDirty(ref)

    return (
        <Box className={classes.hover} ref={ref}>
            {token.info.image ? (
                <div className={classes.card}>
                    <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href={resolveCollectibleLink(chainId, provider, token)}>
                        <div className={classes.imgContainer}>
                            <img
                                src={token.info.image}
                                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                            />
                        </div>
                    </Link>
                    <Box className={classes.description} py={1} px={3}>
                        {isHovering ? (
                            <Box>
                                <Button
                                    size="small"
                                    fullWidth
                                    onClick={onSend}
                                    variant="rounded"
                                    style={{ boxShadow: 'none' }}
                                    sx={{ fontWeight: 'bolder', height: '28px' }}>
                                    {t.send()}
                                </Button>
                            </Box>
                        ) : (
                            <Typography className={classes.name} color="textPrimary" variant="body2" onClick={onSend}>
                                {token.info.name}
                            </Typography>
                        )}
                    </Box>
                </div>
            ) : (
                <Box>
                    <CollectiblePlaceholder onSend={onSend} isHovering={isHovering} />
                </Box>
            )}
        </Box>
    )
})
