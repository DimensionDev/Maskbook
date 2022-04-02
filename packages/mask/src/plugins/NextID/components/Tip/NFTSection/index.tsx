import { useNetworkDescriptor, useWeb3State as useWeb3PluginState } from '@masknet/plugin-infra'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { isSameAddress, useAccount } from '@masknet/web3-shared-evm'
import { CircularProgress } from '@mui/material'
import classnames from 'classnames'
import { uniqWith } from 'lodash-unified'
import { FC, HTMLProps, useEffect, useMemo, useState } from 'react'
import { useAsyncRetry, useTimeoutFn } from 'react-use'
import { WalletMessages } from '../../../../Wallet/messages'
import { useTip } from '../../../contexts'
import { NFTList } from './NFTList'

export * from './NFTList'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    selectSection: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    list: {
        flexGrow: 1,
        maxHeight: 400,
        overflow: 'auto',
        borderRadius: 4,
    },
    loadingOwnerList: {
        margin: '24px auto 16px',
    },
    errorMessage: {
        marginTop: theme.spacing(3),
        fontSize: 12,
        color: theme.palette.error.main,
        marginBottom: theme.spacing(3),
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {}

export const NFTSection: FC<Props> = ({ className, ...rest }) => {
    const { storedTokens, erc721TokenId, setErc721TokenId, setErc721Address } = useTip()
    const { classes } = useStyles()
    const account = useAccount()
    const selectedIds = useMemo(() => (erc721TokenId ? [erc721TokenId] : []), [erc721TokenId])
    const { Asset } = useWeb3PluginState()

    const networkDescriptor = useNetworkDescriptor()

    // Cannot get the loading status of fetching via websocket
    // loading status of `useAsyncRetry` is not the real status
    const [guessLoading, setGuessLoading] = useState(true)
    useTimeoutFn(() => {
        setGuessLoading(false)
    }, 10000)

    const {
        value = { data: EMPTY_LIST },
        loading,
        retry,
    } = useAsyncRetry(async () => {
        const result = await Asset?.getNonFungibleAssets?.(account, { page: 0 }, undefined, networkDescriptor)
        return result
    }, [account, Asset?.getNonFungibleAssets, networkDescriptor])

    useEffect(() => {
        const unsubscribeTokens = WalletMessages.events.erc721TokensUpdated.on(retry)
        const unsubscribeSocket = WalletMessages.events.socketMessageUpdated.on((info) => {
            setGuessLoading(info.done)
            if (!info.done) {
                retry()
            }
        })
        return () => {
            unsubscribeTokens()
            unsubscribeSocket()
        }
    }, [retry])

    const fetchedTokens = value?.data ?? EMPTY_LIST

    const tokens = useMemo(() => {
        return uniqWith([...storedTokens, ...fetchedTokens], (v1, v2) => {
            return isSameAddress(v1.contract?.address, v2.contract?.address) && v1.tokenId === v2.tokenId
        })
    }, [storedTokens, fetchedTokens])

    const showLoadingIndicator = tokens.length === 0 && (loading || guessLoading)

    return (
        <div className={classnames(classes.root, className)} {...rest}>
            <div className={classes.selectSection}>
                {showLoadingIndicator ? (
                    <CircularProgress size={24} className={classes.loadingOwnerList} />
                ) : (
                    <NFTList
                        className={classes.list}
                        selectedIds={selectedIds}
                        tokens={tokens}
                        onChange={(id, address) => {
                            setErc721TokenId(id)
                            setErc721Address(address)
                        }}
                    />
                )}
            </div>
        </div>
    )
}
