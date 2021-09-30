import { Dispatch, memo, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useContacts } from '../../hooks/useContacts'
import type { RelationProfile } from '@masknet/shared'
import { Table, TableContainer, TableBody, Box, TablePagination } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'
import { ContactTableRow } from '../ContactTableRow'
import { EmptyContactPlaceholder } from '../EmptyContactPlaceholder'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { sortBy } from 'lodash-es'
import { useDashboardI18N } from '../../../../locales'
import { Messages } from '../../../../API'

const useStyles = makeStyles()((theme) => ({
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100% - 58px)',
    },
    header: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular,
        padding: '24px 28px',
        backgroundColor: MaskColorVar.primaryBackground,
    },
    footer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationItem: {
        borderRadius: 4,
        border: `1px solid ${MaskColorVar.lineLight}`,
        color: MaskColorVar.textPrimary,
        '&.Mui-selected': {
            backgroundColor: MaskColorVar.blue,
            color: '#ffffff',
            border: 'none',
            '&:hover': {
                backgroundColor: MaskColorVar.blue,
            },
        },
    },
}))

export interface ContactsTableProps {
    network: string
}

const PageSize = 20

export const ContactsTable = memo<ContactsTableProps>(({ network }) => {
    const [page, setPage] = useState(0)

    const { value, error, loading, retry } = useContacts(network, page, PageSize)

    const dataSource = useMemo(() => {
        if (!value) return []
        return sortBy(
            value.map<RelationProfile>((profile) => ({
                favorite: !profile.favor,
                name: profile.nickname || profile.identifier.userId || '',
                fingerprint: profile.linkedPersona?.fingerprint,
                identifier: profile.identifier,
                avatar: profile.avatar,
            })),
            (item) => !item.favorite,
        )
    }, [value, page])

    useEffect(() => {
        setPage(0)
    }, [network])

    useEffect(() => {
        return Messages.events.relationsChanged.on(retry)
    }, [retry])

    return (
        <ContactsTableUI
            isEmpty={!!error || !dataSource.length}
            isLoading={loading}
            network={network}
            dataSource={dataSource}
            page={page}
            onPageChange={setPage}
            showPagination={!loading && !error && !!value?.length}
            onReset={() => setPage(0)}
        />
    )
})

export interface ContactsTableUIProps extends ContactsTableProps {
    dataSource: RelationProfile[]
    isEmpty: boolean
    isLoading: boolean
    page: number
    onPageChange: Dispatch<SetStateAction<number>>
    showPagination: boolean
    onReset: () => void
}

export const ContactsTableUI = memo<ContactsTableUIProps>(
    ({ showPagination, page, onPageChange, network, dataSource, isEmpty, isLoading, onReset }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()
        return (
            <>
                <TableContainer className={classes.container}>
                    {isEmpty || isLoading ? (
                        <Box flex={1}>
                            {isLoading ? <LoadingPlaceholder /> : isEmpty ? <EmptyContactPlaceholder /> : null}
                        </Box>
                    ) : (
                        <Table stickyHeader>
                            {dataSource.length ? (
                                <TableBody>
                                    {dataSource.map((item, index) => (
                                        <ContactTableRow
                                            key={index}
                                            contact={item}
                                            index={page * PageSize + index + 1}
                                            network={network}
                                            onReset={onReset}
                                        />
                                    ))}
                                </TableBody>
                            ) : null}
                        </Table>
                    )}
                </TableContainer>
                {showPagination && !isEmpty ? (
                    <Box className={classes.footer}>
                        <TablePagination
                            count={-1}
                            component="div"
                            onPageChange={() => {}}
                            page={page}
                            rowsPerPage={PageSize}
                            rowsPerPageOptions={[PageSize]}
                            labelDisplayedRows={() => null}
                            backIconButtonProps={{
                                onClick: () => onPageChange((prev) => prev - 1),
                                size: 'small',
                                disabled: page === 0,
                            }}
                            nextIconButtonProps={{
                                onClick: () => onPageChange((prev) => prev + 1),
                                disabled: dataSource.length < PageSize,
                                size: 'small',
                            }}
                        />
                    </Box>
                ) : null}
            </>
        )
    },
)
