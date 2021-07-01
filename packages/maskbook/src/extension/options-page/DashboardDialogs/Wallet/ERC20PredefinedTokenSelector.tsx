import { useState } from 'react'
import { Box, makeStyles, TextField } from '@material-ui/core'
import { EthereumTokenType, ERC20TokenDetailed } from '@masknet/web3-shared'
import { useI18N } from '../../../../utils'
import { FixedTokenList } from '../../DashboardComponents/FixedTokenList'

const useERC20PredefinedTokenSelectorStyles = makeStyles((theme) => ({
    list: {
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    search: {
        marginBottom: theme.spacing(1),
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
    const classes = useERC20PredefinedTokenSelectorStyles()

    const { onTokenChange, excludeTokens = [] } = props
    const [keyword, setKeyword] = useState('')

    return (
        <Box
            sx={{
                textAlign: 'left',
            }}>
            <TextField
                className={classes.search}
                label={t('add_token_search_hint')}
                autoFocus
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                variant="outlined"
            />
            <FixedTokenList
                classes={{ list: classes.list, placeholder: classes.placeholder }}
                keyword={keyword}
                blacklist={excludeTokens}
                onSubmit={(token) => token.type === EthereumTokenType.ERC20 && onTokenChange?.(token)}
                FixedSizeListProps={{
                    height: 192,
                    itemSize: 52,
                    overscanCount: 2,
                }}
            />
        </Box>
    )
}
