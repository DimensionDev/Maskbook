import { makeStyles } from '@masknet/theme'
import { useAccount, useERC721TokenDetailedOwnerList } from '@masknet/web3-shared-evm'
import { Button, FormControl } from '@mui/material'
import classnames from 'classnames'
import { FC, HTMLProps, useCallback, useMemo, useState } from 'react'
import { SearchInput } from '../../../../../extension/options-page/DashboardComponents/SearchInput'
import { useI18N } from '../../../../../utils'
import { ERC721ContractSelectPanel } from '../../../../../web3/UI/ERC721ContractSelectPanel'
import { useTip } from '../../../contexts'
import { NFTList } from './NFTList'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
    },
    selectSection: {
        marginTop: theme.spacing(1.5),
    },
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        maxHeight: 400,
        overflow: 'auto',
        gridGap: 18,
    },
    keyword: {
        borderRadius: 6,
        marginRight: theme.spacing(1.5),
    },
    searchButton: {
        borderRadius: 6,
        width: 100,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {}

export const NFTSection: FC<Props> = ({ className, ...rest }) => {
    const { t } = useI18N()
    const { erc721Contract, setErc721Contract, erc721TokenId, setErc721TokenId } = useTip()
    const { classes } = useStyles()
    const [balance, setBalance] = useState(0)
    const onSearch = useCallback(() => {}, [])
    const [open, setOpen] = useState(false)
    const account = useAccount()
    const {
        asyncRetry: { loading: loadingMyTokens },
        tokenDetailedOwnerList: myTokens = [],
        clearTokenDetailedOwnerList,
    } = useERC721TokenDetailedOwnerList(erc721Contract, account)

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
                <div className={classes.selectSection}>
                    <FormControl className={classes.row}>
                        <SearchInput classes={{ root: classes.keyword }} label="" />
                        <Button className={classes.searchButton} variant="contained" onClick={onSearch}>
                            {t('search')}
                        </Button>
                    </FormControl>
                    <NFTList
                        className={classes.list}
                        selectedIds={selectedIds}
                        tokens={myTokens}
                        onChange={(ids) => {
                            setErc721TokenId(ids.length ? ids[0] : null)
                        }}
                    />
                </div>
            ) : null}
        </div>
    )
}
