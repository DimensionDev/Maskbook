import { makeStyles } from '@masknet/theme'
import { ERC721TokenDetailed, useAccount, useERC721TokenDetailedCallback } from '@masknet/web3-shared-evm'
import { useERC721TokenDetailedOwnerList } from '@masknet/web3-providers'
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
    const [tokenId, setTokenId, erc721TokenDetailedCallback] = useERC721TokenDetailedCallback(erc721Contract)
    const { classes } = useStyles()
    const account = useAccount()
    const { tokenDetailedOwnerList: myTokens = [] } = useERC721TokenDetailedOwnerList(erc721Contract, account)

    const selectedIds = useMemo(() => (erc721TokenId ? [erc721TokenId] : []), [erc721TokenId])

    const [searchedToken, setSearchedToken] = useState<ERC721TokenDetailed | null>(null)
    const onSearch = useCallback(async () => {
        const token = await erc721TokenDetailedCallback()
        setSearchedToken(token?.info.owner ? token : null)
    }, [erc721TokenDetailedCallback])

    const tokens = useMemo(() => (searchedToken ? [searchedToken] : myTokens), [searchedToken, myTokens])

    return (
        <div className={classnames(classes.root, className)} {...rest}>
            <FormControl>
                <ERC721ContractSelectPanel contract={erc721Contract} onContractChange={setErc721Contract} />
            </FormControl>
            {erc721Contract ? (
                <div className={classes.selectSection}>
                    <FormControl className={classes.row}>
                        <SearchInput
                            classes={{ root: classes.keyword }}
                            value={tokenId}
                            onChange={(id) => setTokenId(id)}
                            label=""
                        />
                        <Button className={classes.searchButton} variant="contained" onClick={onSearch}>
                            {t('search')}
                        </Button>
                    </FormControl>
                    <NFTList
                        className={classes.list}
                        selectedIds={selectedIds}
                        tokens={tokens}
                        onChange={(ids) => {
                            setErc721TokenId(ids.length ? ids[0] : null)
                        }}
                    />
                </div>
            ) : null}
        </div>
    )
}
