import { Dispatch, memo, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useContacts } from '../../hooks/useContacts'
import type { RelationProfile } from '@masknet/shared-base'
import { TableContainer, Box, TablePagination, Stack, Table, TableBody } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'
import { EmptyContactPlaceholder } from '../EmptyContactPlaceholder'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { sortBy } from 'lodash-unified'
import { useDashboardI18N } from '../../../../locales'
import { Messages } from '../../../../API'
import { useContainer } from 'unstated-next'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { useUpdateEffect } from 'react-use'
import { RelationFavor } from '@masknet/shared-base'
import { ContactTableRow } from '../ContactTableRow'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    header: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular as any,
        padding: '24px 28px',
        backgroundColor: MaskColorVar.primaryBackground,
    },
    footer: {
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
    const { currentPersona } = useContainer(PersonaContext)

    const { value, error, loading, retry } = useContacts(network, page, PageSize)

    const dataSource = useMemo(() => {
        if (!value) return []
        return sortBy(
            value.map<RelationProfile>((profile) => ({
                favorite: profile.favor === RelationFavor.COLLECTED,
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

    useUpdateEffect(() => {
        setPage(0)
    }, [currentPersona])

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
            <Stack justifyContent="space-between" height="100%">
                <Box flex={1}>
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
                </Box>
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
            </Stack>
        )
    },
)
