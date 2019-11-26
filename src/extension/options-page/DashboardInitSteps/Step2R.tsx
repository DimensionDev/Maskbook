import React, { useRef, useState } from 'react'
import StepBase from './StepBase'
import { Button, Table, TableBody, TableRow, TableCell, styled } from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'

const header = 'Restoration Successful'
const subheader = 'Restored from a backup at 2020-01-01 09:41 (UTC+0).'

const actions = (
    <div>
        <Button className="actionButton" variant="contained" color="primary">
            Done
        </Button>
    </div>
)

const TableCellNoBorder = styled(TableCell)({
    borderBottom: 'none',
})

export default function InitStep2R() {
    const rows = [
        { name: 'Personas', value: '1' },
        { name: 'Profiles', value: '1' },
        { name: 'Posts', value: '1' },
        { name: 'Contacts', value: '1' },
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
