import { Icons } from '@masknet/icons'
import { useAccount, useNonFungibleAssets } from '@masknet/plugin-infra/web3'
import { RetryHint } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { isSameAddress, NetworkPluginID, NonFungibleAsset } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Button, FormControl, Typography } from '@mui/material'
import classnames from 'classnames'
import { uniqWith } from 'lodash-unified'
import { FC, HTMLProps, useCallback, useMemo } from 'react'
import { useBoolean } from 'react-use'
import { CollectibleList } from '../../../../extension/options-page/DashboardComponents/CollectibleList/index.js'
import { TargetRuntimeContext, useTip } from '../../contexts/index.js'
import { Translate, useI18N } from '../../locales/index.js'
import { AddDialog } from '../AddDialog.js'

export * from './NFTList.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: '100%',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
    },
    selectSection: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    statusBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 282,
    },
    loadingText: {
        marginTop: theme.spacing(1),
    },
    list: {
        flexGrow: 1,
        maxHeight: 400,
        overflow: 'auto',
        borderRadius: 4,
    },
    errorMessage: {
        marginTop: theme.spacing(3),
        fontSize: 12,
        color: theme.palette.error.main,
        marginBottom: theme.spacing(3),
    },
    addButton: {
        marginLeft: 'auto',
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {
    onEmpty?(empty: boolean): void
}

export const NFTSection: FC<Props> = ({ className, onEmpty, ...rest }) => {
    const {
        nonFungibleTokenAddress: tokenAddress,
        nonFungibleTokenId: tokenId,
        setNonFungibleTokenId,
        setNonFungibleTokenAddress,
    } = useTip()
    const { classes, theme } = useStyles()
    const t = useI18N()
    const [addTokenDialogIsOpen, openAddTokenDialog] = useBoolean(false)
    const selectedKey = tokenAddress || tokenId ? `${tokenAddress}_${tokenId}` : undefined
    const account = useAccount()

    const { targetChainId: chainId, pluginId } = TargetRuntimeContext.useContainer()
    const {
        value: fetchedTokens = EMPTY_LIST,
        done,
        next,
        loading,
        error: loadError,
    } = useNonFungibleAssets(pluginId, undefined, { chainId })

    const isEvm = pluginId === NetworkPluginID.PLUGIN_EVM
    const tokens = useMemo(() => {
        return uniqWith(
            fetchedTokens,
            isEvm
                ? (v1, v2) => {
                      return isSameAddress(v1.contract?.address, v2.contract?.address) && v1.tokenId === v2.tokenId
                  }
                : (v1, v2) => v1.tokenId === v2.tokenId,
        )
    }, [fetchedTokens, isEvm])

    const handleAddToken = useCallback((token: NonFungibleAsset<ChainId, SchemaType>) => {
        setNonFungibleTokenAddress(token.address ?? '')
        setNonFungibleTokenId(token.tokenId)
        openAddTokenDialog(false)
    }, [])

    return (
        <div className={classnames(classes.root, className)} {...rest}>
            <FormControl className={classes.header}>
                {loading ? null : (
                    <Typography fontSize={14} fontWeight={700} color={(theme) => theme.palette.maskColor.second}>
                        <Translate.nft_amount
                            values={{ count: tokens.length.toString() }}
                            components={{
                                strong: (
                                    <Typography
                                        component="strong"
                                        fontWeight={700}
                                        color={(theme) => theme.palette.maskColor.main}
                                    />
                                ),
                            }}
                        />
                    </Typography>
                )}
                {isEvm ? (
                    <Button variant="text" className={classes.addButton} onClick={() => openAddTokenDialog(true)}>
                        {t.tip_add_collectibles()}
                    </Button>
                ) : null}
            </FormControl>
            <div className={classes.selectSection}>
                {(() => {
                    if (tokens.length) {
                        return (
                            <CollectibleList
                                retry={next}
                                collectibles={tokens}
                                loading={loading}
                                columns={4}
                                selectable
                                value={selectedKey}
                                onChange={(value: string | null) => {
                                    if (!value) {
                                        setNonFungibleTokenAddress('')
                                        setNonFungibleTokenId('')
                                        return
                                    }
                                    const [address, tokenId] = value.split('_')
                                    setNonFungibleTokenAddress(address)
                                    setNonFungibleTokenId(tokenId)
                                }}
                            />
                        )
                    }
                    if (tokens.length === 0 && loadError && account) {
                        return <RetryHint retry={next} />
                    }
                    if (tokens.length === 0 && (!done || loading) && account) {
                        return (
                            <div className={classes.statusBox}>
                                <LoadingBase size={36} />
                                <Typography fontSize={14} className={classes.loadingText}>
                                    {t.tip_loading()}
                                </Typography>
                            </div>
                        )
                    }
                    return (
                        <div className={classes.statusBox}>
                            <Icons.EmptySimple size={36} color={theme.palette.maskColor.third} />
                            <Typography className={classes.loadingText} color={theme.palette.maskColor.second}>
                                {t.tip_empty_nft()}
                            </Typography>
                        </div>
                    )
                })()}
            </div>
            <AddDialog open={addTokenDialogIsOpen} onClose={() => openAddTokenDialog(false)} onAdd={handleAddToken} />
        </div>
    )
}
