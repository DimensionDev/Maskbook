import { makeStyles } from '@masknet/theme'
import { EMPTY_LIST, useAccount, useChainId, useERC721TokenDetailedOwnerList } from '@masknet/web3-shared-evm'
import { Button, FormControl } from '@mui/material'
import classnames from 'classnames'
import { FC, HTMLProps, useCallback, useMemo, useState } from 'react'
import { SearchInput } from '../../../../../extension/options-page/DashboardComponents/SearchInput'
import { useI18N } from '../../../../../utils'
import { ERC721ContractSelectPanel } from '../../../../../web3/UI/ERC721ContractSelectPanel'
import { OrderedERC721Token, SelectNftTokenDialog } from '../../../../RedPacket/SNSAdaptor/SelectNftTokenDialog'
import { useTip } from '../../../contexts'
import { NFTList } from './NFTList'

const useStyles = makeStyles()({
    root: {
        display: 'flex',
        flexDirection: 'column',
    },
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridGap: 18,
    },
    keyword: {
        borderRadius: 6,
    },
    searchButton: {
        borderRadius: 6,
        width: 100,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
    },
})

interface Props extends HTMLProps<HTMLDivElement> {}

export const NFTSection: FC<Props> = ({ className, ...rest }) => {
    const { t } = useI18N()
    const { erc721Contract, setErc721Contract, erc721TokenId, setErc721TokenId } = useTip()
    const { classes } = useStyles()
    const [balance, setBalance] = useState(0)
    const onSearch = useCallback(() => {}, [])
    const [open, setOpen] = useState(false)
    const account = useAccount()
    const [tokenList, setTokenList] = useState<OrderedERC721Token[]>(EMPTY_LIST)
    const {
        asyncRetry: { loading: loadingOwnerList },
        tokenDetailedOwnerList: _tokenDetailedOwnerList = [],
        clearTokenDetailedOwnerList,
    } = useERC721TokenDetailedOwnerList(erc721Contract, account)

    const tokenDetailedOwnerList = _tokenDetailedOwnerList.map((v, index) => ({ ...v, index } as OrderedERC721Token))
    const chainId = useChainId()

    const selectedIds = useMemo(() => (erc721TokenId ? [erc721TokenId] : []), [erc721TokenId])

    return (
        <div className={classnames(classes.root, className)} {...rest}>
            <FormControl>
                <ERC721ContractSelectPanel
                    contract={erc721Contract}
                    onContractChange={setErc721Contract}
                    onBalanceChange={setBalance}
                />
            </FormControl>
            {erc721Contract ? (
                <div>
                    <FormControl className={classes.row}>
                        <SearchInput label="" />
                        <Button className={classes.searchButton} variant="contained" onClick={onSearch}>
                            {t('search')}
                        </Button>
                    </FormControl>
                    <Button onClick={() => setOpen(true)}>Pick</Button>
                    <NFTList
                        className={classes.list}
                        selectedIds={selectedIds}
                        tokens={[
                            ..._tokenDetailedOwnerList,
                            ..._tokenDetailedOwnerList,
                            ..._tokenDetailedOwnerList,
                            ..._tokenDetailedOwnerList,
                            ..._tokenDetailedOwnerList,
                        ]}
                        onChange={(ids) => {
                            setErc721TokenId(ids.length ? ids[0] : null)
                        }}
                    />
                </div>
            ) : null}
            <SelectNftTokenDialog
                open={open}
                onClose={() => setOpen(false)}
                contract={erc721Contract}
                existTokenDetailedList={EMPTY_LIST}
                setExistTokenDetailedList={setTokenList}
                tokenDetailedOwnerList={tokenDetailedOwnerList}
                loadingOwnerList={loadingOwnerList}
            />
        </div>
    )
}
