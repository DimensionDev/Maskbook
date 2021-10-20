import { useState } from 'react'
import { Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { EthereumTokenType, ERC20TokenDetailed } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../utils'
import { FixedTokenList } from '../../DashboardComponents/FixedTokenList'
import { SearchInput } from '../../DashboardComponents/SearchInput'

const useERC20PredefinedTokenSelectorStyles = makeStyles()((theme) => ({
    list: {
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    placeholder: {
        textAlign: 'center',
        paddingTop: theme.spacing(10.5),
        paddingBottom: theme.spacing(10.5),
    },
}))

interface ERC20PredefinedTokenSelectorProps {
    excludeTokens?: string[]
    onTokenChange?: (next: ERC20TokenDetailed | null) => void
}

export function ERC20PredefinedTokenSelector(props: ERC20PredefinedTokenSelectorProps) {
    const { t } = useI18N()
    const { classes } = useERC20PredefinedTokenSelectorStyles()
    const { onTokenChange, excludeTokens = [] } = props
    const [keyword, setKeyword] = useState('')

    return (
        <Box
            sx={{
                textAlign: 'left',
            }}>
            <SearchInput
                label={t('add_token_search_hint')}
                onChange={(keyword) => {
                    setKeyword(keyword)
                }}
            />
            <FixedTokenList
                classes={{ list: classes.list, placeholder: classes.placeholder }}
                keyword={keyword}
                blacklist={excludeTokens}
                onSelect={(token) => onTokenChange?.(token?.type === EthereumTokenType.ERC20 ? token : null)}
                FixedSizeListProps={{
                    height: 192,
                    itemSize: 52,
                    overscanCount: 2,
                }}
            />
        </Box>
    )
}
