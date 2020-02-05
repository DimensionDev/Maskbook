import React from 'react'
import { storiesOf } from '@storybook/react'
import { ChooseIdentity } from '../components/shared/ChooseIdentity'
import { SettingsUI } from '../components/shared-settings/useSettingsUI'
import { ValueRef } from '@holoflows/kit/es'
import { List, Paper } from '@material-ui/core'
import { useValueRef } from '../utils/hooks/useValueRef'

storiesOf('Shared Components', module)
    .add('ChooseIdentity', () => {
        return <ChooseIdentity />
    })
    .add('useSettingsUI', () => {
        function D(props: { x: ValueRef<any> }) {
            const x = useValueRef(props.x)
            return (
                <div>
                    {String(x)} (type: {typeof x})
                </div>
            )
        }
        return (
            <Paper>
                <D x={booleanRef} />
                <D x={syntaxKind} />
                <D x={numberKind} />
                <List>
                    <SettingsUI value={booleanRef} mode={{ type: 'auto', primary: 'boolean setting' }} />
                    <SettingsUI value={syntaxKind} mode={{ type: 'enum', enum: SyntaxKind, primary: 'String enum' }} />
                    <SettingsUI value={numberKind} mode={{ type: 'enum', enum: NumberKind, primary: 'Number enum' }} />
                </List>
            </Paper>
        )
    })
enum SyntaxKind {
    ImportDeclaration = 'import',
    ExportDeclaration = 'export',
}
enum NumberKind {
    Minus100 = -100,
    Zero = 0,
    One = 1,
}
const syntaxKind = new ValueRef<SyntaxKind>(SyntaxKind.ImportDeclaration)
const numberKind = new ValueRef<NumberKind>(NumberKind.Zero)
const booleanRef = new ValueRef<boolean>(false)
