import { memo, useMemo } from 'react'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { useContacts } from '../../hooks/useContacts'
import type { Contact } from '@masknet/shared'
import { Table, TableCell, TableContainer, TableHead, TableRow, makeStyles, TableBody } from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'
import { ContactTableRow } from '../ContactTableRow'

const useStyles = makeStyles((theme) => ({
    header: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular,
        padding: '24px 28px',
        backgroundColor: MaskColorVar.primaryBackground,
    },
}))

export const ContactsTable = memo(() => {
    const { currentPersona } = PersonaContext.useContainer()

    const { value } = useContacts('twitter.com', currentPersona)

    const dataSource = useMemo(() => {
        if (!value) return []
        return value.map<Contact>((profile) => ({
            favorite: profile.favorite,
            name: profile.nickname || profile.identifier.userId || '',
            fingerprint: profile.linkedPersona?.fingerprint,
            identifier: profile.identifier,
            avatar: profile.avatar,
        }))
    }, [value])

    console.log(dataSource)
    return <ContactsTableUI dataSource={dataSource} />
})

export interface ContactsTableUIProps {
    dataSource: Contact[]
}

export const ContactsTableUI = memo<ContactsTableUIProps>(({ dataSource }) => {
    const classes = useStyles()
    return (
        <TableContainer>
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
                            <ContactTableRow key={index} contact={item} index={index + 1} />
                        ))}
                    </TableBody>
                ) : null}
            </Table>
        </TableContainer>
    )
})
