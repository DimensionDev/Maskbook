import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { ContactCard } from '../ContactCard/index.js'
import { Box } from '@mui/material'
import { EmptyStatus, RestorableScroll, ElementAnchor } from '@masknet/shared'
import type { NextIDPersonaBindingsWithIdentifier } from '../../../hooks/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    empty: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 12,
        color: theme.palette.text.secondary,
        whiteSpace: 'nowrap',
    },
    cardContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '0 16px 16px 16px',
        flexGrow: 1,
        overflow: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface SearchListProps {
    searchResult: NextIDPersonaBindingsWithIdentifier[]
    fetchNextPage: () => void
    refetch: () => void
}

export const SearchList = memo<SearchListProps>(function SearchList({ searchResult, fetchNextPage, refetch }) {
    const { classes } = useStyles()
    return searchResult.length === 0 ?
            <EmptyStatus className={classes.empty}>
                <Trans>No search results</Trans>
            </EmptyStatus>
        :   <RestorableScroll scrollKey="search_contacts">
                <Box className={classes.cardContainer}>
                    {searchResult.map((friend) => {
                        return (
                            <ContactCard
                                key={friend.persona}
                                nextId={friend.persona}
                                proofProfiles={friend.proofs}
                                publicKey={friend.linkedPersona.rawPublicKey}
                                isLocal={friend.isLocal}
                                refetch={refetch}
                                avatar={friend.avatar}
                            />
                        )
                    })}
                    <ElementAnchor callback={() => fetchNextPage()} height={10} />
                </Box>
            </RestorableScroll>
})
