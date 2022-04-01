import { useNetworkDescriptor, useWeb3State as useWeb3PluginState } from '@masknet/plugin-infra'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useAccount } from '@masknet/web3-shared-evm'
import classnames from 'classnames'
import { uniqWith } from 'lodash-unified'
import { FC, HTMLProps, useEffect, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { TargetChainIdContext, useTip } from '../../../contexts'
import { NFTList } from './NFTList'

export * from './NFTList'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    selectSection: {
        marginTop: theme.spacing(1.5),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    list: {
        flexGrow: 1,
        marginTop: theme.spacing(2),
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
}))

interface Props extends HTMLProps<HTMLDivElement> {}

export const NFTSection: FC<Props> = ({ className, ...rest }) => {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { storedTokens, erc721TokenId, setErc721TokenId, setErc721Address } = useTip()
    const { classes } = useStyles()
    const account = useAccount()

    const selectedIds = useMemo(() => (erc721TokenId ? [erc721TokenId] : []), [erc721TokenId])

    const { Asset } = useWeb3PluginState()

    const networkDescriptor = useNetworkDescriptor()

    const { value = { data: EMPTY_LIST, hasNextPage: false }, retry } = useAsyncRetry(
        async () => Asset?.getNonFungibleAssets?.(account, { page: 0, size: 1000 }, undefined, networkDescriptor),
        [account, Asset?.getNonFungibleAssets, networkDescriptor],
    )

    useEffect(retry, [chainId])

    const tokens = useMemo(() => {
        return uniqWith([...storedTokens, ...value.data], (v1, v2) => {
            return v1.contract?.address === v2.contract?.address && v1.tokenId === v2.tokenId
        })
    }, [storedTokens, value.data])

    return (
        <div className={classnames(classes.root, className)} {...rest}>
            <div className={classes.selectSection}>
                <NFTList
                    className={classes.list}
                    selectedIds={selectedIds}
                    tokens={tokens}
                    onChange={(id, address) => {
                        setErc721TokenId(id)
                        setErc721Address(address)
                    }}
                />
            </div>
        </div>
    )
}
