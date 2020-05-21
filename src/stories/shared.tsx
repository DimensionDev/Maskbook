import React from 'react'
import { storiesOf } from '@storybook/react'
import { ChooseIdentity } from '../components/shared/ChooseIdentity'
import { SettingsUI, SettingsUIEnum } from '../components/shared-settings/useSettingsUI'
import { ValueRef } from '@holoflows/kit/es'
import { List, Paper } from '@material-ui/core'
import { useValueRef } from '../utils/hooks/useValueRef'

storiesOf('Shared Components', module)
    .add('ChooseIdentity', () => {
        return <ChooseIdentity />
    })
    .add('SettingsUI', () => {
        function D(props: { x: ValueRef<any> }) {
            const x = useValueRef(props.x)
            return (
                <span>
                    Current value: {String(x)} (type: {typeof x})
                </span>
            )
        }
        const b = <SettingsUI key="boolean" value={bool} primary="boolean" secondary={<D x={bool} />} />
        const enum__ = (
            <SettingsUIEnum
                value={syntaxKind}
                enumObject={SyntaxKind}
                primary="String enum"
                secondary={<D x={syntaxKind} />}
            />
        )
        const enum_ = (
            <SettingsUIEnum
                value={numberKind}
                enumObject={NumberKind}
                primary="Number enum"
                secondary={<D x={numberKind} />}
            />
        )
        return (
            <Paper>
                <List>
                    {b}
                    {enum__}
                    {enum_}
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
const bool = new ValueRef<boolean>(false)
