import React from 'react'
import StepBase from './StepBase'
import { Table, TableBody, TableRow, TableCell, styled } from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'
import ActionButton from '../DashboardComponents/ActionButton'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { Link } from 'react-router-dom'

const TableCellNoBorder = styled(TableCell)({
    borderBottom: 'none',
})

export default function InitStep2R() {
    const { personas, profiles, posts, contacts, date } = useQueryParams([
        'personas',
        'profiles',
        'posts',
        'contacts',
        'date',
    ])

    const header = geti18nString('dashboard_restoration_successful')
    const subheader = geti18nString(
        'dashboard_restoration_successful_hint',
        new Date(date ? Number(date) : 0).toLocaleString(),
    )

    const actions = (
        <div>
            <ActionButton<typeof Link> variant="contained" color="primary" component={Link} to="/">
                {geti18nString('finish')}
            </ActionButton>
        </div>
    )

    const rows = [
        { name: 'Personas', value: personas ?? 0 },
        { name: 'Profiles', value: profiles ?? 0 },
        { name: 'Posts', value: posts ?? 0 },
        { name: 'Contacts', value: contacts ?? 0 },
    ]
    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <Table size="small" style={{ maxWidth: 250, margin: 'auto' }}>
                <TableBody>
                    {rows.map(row => (
                        <TableRow key={row.name}>
                            <TableCellNoBorder component="th" align="left">
                                {row.name}
                            </TableCellNoBorder>
                            <TableCellNoBorder align="right">{row.value}</TableCellNoBorder>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )

    return (
        <StepBase header={header} subheader={subheader} actions={actions}>
            {content}
        </StepBase>
    )
}
