import { configure, addDecorator } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'
import { withInfo } from '@storybook/addon-info'
import { muiTheme } from 'storybook-addon-material-ui'
import { withOptions } from '@storybook/addon-options'
import { themes } from '@storybook/components'
import { MaskbookDarkTheme, MaskbookLightTheme } from '../src/utils/theme'
import { merge } from 'lodash'

// UI
addDecorator(
    withOptions({
        name: 'Maskbook',
        addonPanelInRight: true,
        // @ts-ignore
        theme: { ...themes.dark, mainBackground: 'black' },
    }),
)
addDecorator(
    withInfo({
        inline: true,
        header: false,
        TableComponent,
        styles: x =>
            merge(x, {
                infoBody: { background: 'transparent', filter: 'invert(1)', padding: '0', border: 'none' },
                infoStory: { background: '#e8e8e8', padding: '2em' },
                infoContent: { marginTop: 16 },
                jsxInfoContent: { filter: 'invert(1)', marginTop: 16 },
                source: {
                    h1: { fontWeight: 100 },
                },
                propTableHead: { fontWeight: 100 },
            }),
    }),
)
// Addons
addDecorator(withKnobs)
// Theme for MUI
addDecorator(muiTheme([MaskbookLightTheme, MaskbookDarkTheme]))
function loadStories() {
    require('../src/stories')
}

configure(loadStories, module)

import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

function TableComponent({ propDefinitions }) {
    const props = propDefinitions.map(({ property, propType, required, description, defaultValue }) => {
        return (
            <TableRow key={property}>
                <TableCell>
                    {property}
                    {required ? null : '?'}
                </TableCell>
                <TableCell>{propType.name}</TableCell>
                <TableCell>{defaultValue}</TableCell>
                <TableCell>{description}</TableCell>
            </TableRow>
        )
    })

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>名称</TableCell>
                    <TableCell>类型</TableCell>
                    <TableCell>默认值</TableCell>
                    <TableCell>描述</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>{props}</TableBody>
        </Table>
    )
}
