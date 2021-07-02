import { memo, useMemo } from 'react'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { useContacts } from '../../hooks/useContacts'
import type { Contact } from '@masknet/shared'
import { Table, TableCell, TableContainer, TableHead, TableRow, makeStyles, TableBody, Box } from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'
import { ContactTableRow } from '../ContactTableRow'
import { EmptyContactPlaceholder } from '../EmptyContactPlaceholder'
import { LoadingPlaceholder } from '../../../../components/LoadingPlacholder'
import { sortBy } from 'lodash-es'

const useStyles = makeStyles((theme) => ({
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular,
        padding: '24px 28px',
        backgroundColor: MaskColorVar.primaryBackground,
    },
}))

export interface ContactsTableProps {
    network: string
}

export const ContactsTable = memo<ContactsTableProps>(({ network }) => {
    const { currentPersona } = PersonaContext.useContainer()

    const { value, error, loading } = useContacts(network, currentPersona)

    const dataSource = useMemo(() => {
        if (!value) return []
        return sortBy(
            value.map<Contact>((profile) => ({
                favorite: profile.favorite,
                name: profile.nickname || profile.identifier.userId || '',
                fingerprint: profile.linkedPersona?.fingerprint,
                identifier: profile.identifier,
                avatar: profile.avatar,
            })),
            (item) => item.favorite,
        )
    }, [value])

    return (
        <ContactsTableUI
            isEmpty={!!error || !dataSource.length}
            isLoading={loading}
            network={network}
            dataSource={dataSource}
        />
    )
})

export interface ContactsTableUIProps extends ContactsTableProps {
    dataSource: Contact[]
    isEmpty: boolean
    isLoading: boolean
}

export const ContactsTableUI = memo<ContactsTableUIProps>(({ network, dataSource, isEmpty, isLoading }) => {
    const classes = useStyles()
    return (
        <TableContainer className={classes.container}>
            {isEmpty || isLoading ? (
                <Box flex={1}>{isLoading ? <LoadingPlaceholder /> : isEmpty ? <EmptyContactPlaceholder /> : null}</Box>
            ) : (
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell variant="head" align="center" className={classes.header}>
                                Name
                            </TableCell>
                            <TableCell variant="head" align="center" className={classes.header}>
                                Operation
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    {dataSource.length ? (
                        <TableBody>
                            {dataSource.map((item, index) => (
                                <ContactTableRow key={index} contact={item} index={index + 1} network={network} />
                            ))}
                        </TableBody>
                    ) : null}
                </Table>
            )}
        </TableContainer>
    )
})
