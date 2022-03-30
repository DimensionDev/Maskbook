import { useNetworkDescriptor, useWeb3State as useWeb3PluginState, Web3Plugin } from '@masknet/plugin-infra'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useAccount } from '@masknet/web3-shared-evm'
import { FormControl } from '@mui/material'
import classnames from 'classnames'
import { FC, HTMLProps, useEffect, useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { ERC721ContractSelectPanel } from '../../../../../web3/UI/ERC721ContractSelectPanel'
import { TargetChainIdContext, useTip } from '../../../contexts'
import { useI18N } from '../../../locales'
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
        backgroundColor: theme.palette.background.default,
        borderRadius: 4,
    },
    keyword: {
        borderRadius: 8,
        marginRight: theme.spacing(1.5),
    },
    searchButton: {
        borderRadius: 8,
        width: 100,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
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
    const t = useI18N()
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { erc721Contract, setErc721Contract, erc721TokenId, setErc721TokenId, isSending } = useTip()
    const { classes } = useStyles()
    const account = useAccount()

    const selectedIds = useMemo(() => (erc721TokenId ? [erc721TokenId] : []), [erc721TokenId])

    const { Asset } = useWeb3PluginState()

    const [page, setPage] = useState(0)

    const networkDescriptor = useNetworkDescriptor()
    const [selectedNetwork, setSelectedNetwork] = useState<Web3Plugin.NetworkDescriptor | null>(
        networkDescriptor ?? null,
    )
    const { value = { data: EMPTY_LIST, hasNextPage: false }, retry } = useAsyncRetry(
        async () => Asset?.getNonFungibleAssets?.(account, { page, size: 20 }, undefined, selectedNetwork || undefined),
        [account, Asset?.getNonFungibleAssets, selectedNetwork],
    )

    console.log('nft data', value.data)

    useEffect(retry, [chainId])

    return (
        <div className={classnames(classes.root, className)} {...rest}>
            <FormControl>
                <ERC721ContractSelectPanel
                    chainId={chainId}
                    label={t.tip_contracts()}
                    contract={erc721Contract}
                    onContractChange={setErc721Contract}
                />
            </FormControl>
            <div className={classes.selectSection}>
                <NFTList
                    className={classes.list}
                    selectedIds={selectedIds}
                    tokens={value.data}
                    onChange={(ids) => {
                        setErc721TokenId(ids.length ? ids[0] : null)
                    }}
                />
            </div>
        </div>
    )
}
