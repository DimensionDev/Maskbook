import { useCallback } from 'react'
import { ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { type NonFungibleCollection, SourceType } from '@masknet/web3-shared-base'
import { useWeb3Others } from '@masknet/web3-hooks-base'
import { useSharedI18N } from '../../../locales/index.js'
import { useSelectNonFungibleContract } from '../../../index.js'
import { NetworkPluginID } from '@masknet/shared-base'

interface StyleProps {
    hasIcon: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, props) => {
    return {
        root: {
            height: 52,
            border: `1px solid ${theme.palette.mode === 'light' ? '#EBEEF0' : '#2F3336'}`,
            borderRadius: 12,
            padding: theme.spacing(0.8, 1.2, 1),
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
        },
        title: {},
        wrapper: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
        },
        icon: {
            height: 24,
            width: 24,
            borderRadius: 500,
        },
        tokenWrapper: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        nftName: {
            marginLeft: theme.spacing(props.hasIcon ? 1 : 0),
            fontWeight: 300,
            pointerEvents: 'none',
            fontSize: 16,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        expandIcon: {
            color: theme.palette.text.primary,
        },
        pointer: {
            cursor: 'pointer',
        },
    }
})

export interface ERC721TokenSelectPanelProps {
    label?: string
    chainId?: ChainId
    onContractChange: (contract: NonFungibleCollection<ChainId, SchemaType>) => void
    balance: number
    collection: NonFungibleCollection<ChainId, SchemaType> | null | undefined
}
export function ERC721ContractSelectPanel(props: ERC721TokenSelectPanelProps) {
    const { onContractChange, collection, label, chainId = ChainId.Mainnet, balance } = props
    const t = useSharedI18N()
    const { classes, cx } = useStyles({ hasIcon: !!collection?.iconURL })
    const Others = useWeb3Others()

    const selectNFTContract = useSelectNonFungibleContract<NetworkPluginID.PLUGIN_EVM>()
    const openDialog = useCallback(async () => {
        const contract = await selectNFTContract({
            pluginID: NetworkPluginID.PLUGIN_EVM,
            isERC721Only: true,
            chainId,
        })
        if (contract) onContractChange(contract)
    }, [chainId, selectNFTContract])
    // #endregion

    return (
        <Box className={classes.root}>
            <div className={classes.wrapper}>
                <Typography className={classes.title} color="textSecondary" variant="body2" component="span">
                    {label ?? t.select_an_nft()}
                </Typography>
                {!collection?.address ||
                !Others.isValidAddress(collection.address) ||
                (collection.source === SourceType.SimpleHash && !collection?.id) ? null : (
                    <Typography className={classes.title} color="textSecondary" variant="body2" component="span">
                        {t.wallet_balance()}: {balance ? balance : '0'}
                    </Typography>
                )}
            </div>
            <div className={cx(classes.wrapper, classes.pointer)} onClick={openDialog}>
                <div className={classes.tokenWrapper}>
                    {collection?.iconURL ? <img className={classes.icon} src={collection?.iconURL} /> : null}
                    {collection?.name ? (
                        <Typography className={classes.nftName} color="textPrimary">
                            {collection?.name}
                        </Typography>
                    ) : null}
                </div>
                <ExpandMoreIcon className={classes.expandIcon} />
            </div>
        </Box>
    )
}
