import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { RoutePaths } from '@masknet/plugin-redpacket'
import { TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Utils } from '@masknet/web3-hooks-base'
import { SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Box, Typography, type BoxProps } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const useStyles = makeStyles()((theme) => ({
    root: {
        height: 70,
        borderRadius: 12,
        padding: theme.spacing(1.5),
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'column',
        gap: theme.spacing(0.5),
        backgroundColor: theme.palette.maskColor.input,
    },
    title: {
        fontSize: 13,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
        '& b': {
            fontWeight: 700,
            color: theme.palette.maskColor.main,
        },
    },
    wrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    tokenWrapper: {
        display: 'flex',
        width: '100%',
        gap: theme.spacing(1),
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectButton: {
        display: 'flex',
        gap: theme.spacing(0.5),
        alignItems: 'center',
        height: 24,
        padding: theme.spacing(0.5, 1),
        boxSizing: 'border-box',
        fontSize: 12,
        fontWeight: 700,
        backgroundColor: theme.palette.maskColor.main,
        color: theme.palette.maskColor.bottom,
        cursor: 'pointer',
        borderRadius: 64,
    },
    nftName: {
        fontWeight: 700,
        pointerEvents: 'none',
        fontSize: 18,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        marginRight: 'auto',
    },
    pointer: {
        cursor: 'pointer',
    },
}))

export interface CollectionSelectPanelProps extends BoxProps {
    chainId?: ChainId
    balance: number
    collection?: Web3Helper.NonFungibleCollectionAll
}

export function CollectionSelectPanel({
    collection,
    chainId = ChainId.Mainnet,
    balance,
    className,
    ...rest
}: CollectionSelectPanelProps) {
    const { classes, cx, theme } = useStyles()
    const Utils = useWeb3Utils()
    const navigate = useNavigate()

    return (
        <Box className={cx(classes.root, className)} {...rest}>
            <div className={classes.wrapper}>
                <Typography className={classes.title} color="textSecondary" variant="body2" component="span">
                    <Trans>Collectibles</Trans>
                </Typography>
                {(
                    !collection?.address ||
                    !Utils.isValidAddress(collection.address) ||
                    (collection.source === SourceType.SimpleHash && !collection.id)
                ) ?
                    null
                :   <Typography className={classes.title} component="span">
                        <Trans>
                            Balance: <b>{balance ? balance : '0'}</b>
                        </Trans>
                    </Typography>}
            </div>
            <div
                className={cx(classes.wrapper, classes.pointer)}
                onClick={() => {
                    navigate(RoutePaths.SelectCollectibles)
                }}>
                {collection ?
                    <div className={classes.tokenWrapper}>
                        {collection.iconURL ?
                            <TokenIcon
                                logoURL={collection.iconURL}
                                chainId={collection.chainId}
                                size={24}
                                badgeSize={10}
                            />
                        :   null}
                        <Typography className={classes.nftName}>{collection.name}</Typography>
                        <Icons.ArrowDrop color={theme.palette.maskColor.second} size={24} />
                    </div>
                :   <Typography className={classes.selectButton}>
                        <Trans>Select NFTs</Trans>
                        <Icons.ArrowDrop size={16} />
                    </Typography>
                }
            </div>
        </Box>
    )
}
