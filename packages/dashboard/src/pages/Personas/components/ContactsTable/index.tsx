import { Dispatch, memo, SetStateAction, useMemo, useState } from 'react'
import { useContacts } from '../../hooks/useContacts'
import type { Contact } from '@masknet/shared'
import {
    Table,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    makeStyles,
    TableBody,
    Box,
    Pagination,
    PaginationItem,
} from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'
import { ContactTableRow } from '../ContactTableRow'
import { EmptyContactPlaceholder } from '../EmptyContactPlaceholder'
import { LoadingPlaceholder } from '../../../../components/LoadingPlacholder'
import { ceil, sortBy } from 'lodash-es'
import { useDashboardI18N } from '../../../../locales'

const useStyles = makeStyles((theme) => ({
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

export const ContactsTable = memo<ContactsTableProps>(({ network }) => {
    const [page, setPage] = useState(1)

    const { value, error, loading } = useContacts(network)

    const dataSource = useMemo(() => {
        if (!value) return []
        return sortBy(
            value.map<Contact>((profile) => ({
                favorite: profile.favor,
                name: profile.nickname || profile.identifier.userId || '',
                fingerprint: profile.linkedPersona?.fingerprint,
                identifier: profile.identifier,
                avatar: profile.avatar,
            })),
            (item) => !item.favorite,
        ).slice((page - 1) * 20, page * 20)
    }, [value, page])

    return (
        <ContactsTableUI
            isEmpty={!!error || !dataSource.length}
            isLoading={loading}
            network={network}
            dataSource={dataSource}
            page={page}
            onPageChange={setPage}
            count={ceil((value?.length ?? 0) / 20) ?? 1}
            showPagination={!loading && !error && !!value?.length}
        />
    )
})

export interface ContactsTableUIProps extends ContactsTableProps {
    dataSource: Contact[]
    isEmpty: boolean
    isLoading: boolean
    page: number
    onPageChange: Dispatch<SetStateAction<number>>
    showPagination: boolean
    count: number
}

export const ContactsTableUI = memo<ContactsTableUIProps>(
    ({ showPagination, page, count, onPageChange, network, dataSource, isEmpty, isLoading }) => {
        const t = useDashboardI18N()
        const classes = useStyles()
        return (
            <>
                <TableContainer className={classes.container}>
                    {isEmpty || isLoading ? (
                        <Box flex={1}>
                            {isLoading ? <LoadingPlaceholder /> : isEmpty ? <EmptyContactPlaceholder /> : null}
                        </Box>
                    ) : (
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell variant="head" align="center" className={classes.header}>
                                        {t.personas_contacts_name()}
                                    </TableCell>
                                    <TableCell variant="head" align="center" className={classes.header}>
                                        {t.personas_contacts_operation()}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            {dataSource.length ? (
                                <TableBody>
                                    {dataSource.map((item, index) => (
                                        <ContactTableRow
                                            key={index}
                                            contact={item}
                                            index={(page - 1) * 20 + index + 1}
                                            network={network}
                                        />
                                    ))}
                                </TableBody>
                            ) : null}
                        </Table>
                    )}
                </TableContainer>
                {showPagination && !isEmpty ? (
                    <Box className={classes.footer}>
                        <Pagination
                            variant="outlined"
                            shape="rounded"
                            count={count}
                            page={page}
                            onChange={(event, page) => onPageChange(page)}
                            renderItem={(item) => (
                                <PaginationItem {...item} classes={{ root: classes.paginationItem }} />
                            )}
                        />
                    </Box>
                ) : null}
            </>
        )
    },
)
