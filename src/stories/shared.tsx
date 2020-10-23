import React from 'react'
import { storiesOf } from '@storybook/react'
import { ChooseIdentity } from '../components/shared/ChooseIdentity'
import { SettingsUI, SettingsUIEnum } from '../components/shared-settings/useSettingsUI'
import { ValueRef } from '@dimensiondev/holoflows-kit/es'
import { List, Paper, Typography } from '@material-ui/core'
import { useValueRef } from '../utils/hooks/useValueRef'
import { Image } from '../components/shared/Image'
import { number, radios, boolean, text } from '@storybook/addon-knobs'

let blob: Blob = undefined!
const data = fetch('https://maskbook.com/img/maskbook--logotype-black.png')
    .then((x) => x.blob())
    .then((x) => (blob = x))

storiesOf('Shared Components', module)
    .add('Image', () => {
        const url = 'https://maskbook.com/img/maskbook--logotype-white.png'
        const _ = text('src', 'img')
        const src = _ === 'img' ? url : _ === 'blob' ? blob : _
        return (
            <Paper>
                <Typography>You can use "img" as src to refer to {url}</Typography>
                <Typography>You can use "blob" as src to refer to a blob</Typography>
                <div style={{ border: '1px solid red', display: 'inline-block' }}>
                    <Image
                        width={number('width', 400)}
                        height={number('height', 200)}
                        origin={radios('origin', { current: 'current', extension: 'extension', auto: 'auto' }, 'auto')}
                        component={radios('component', { canvas: 'canvas', img: 'img' }, 'canvas')}
                        loading={boolean('loading', false)}
                        src={src}
                        ref={console.log}
                    />
                </div>
            </Paper>
        )
    })
    .add('ChooseIdentity', () => {
        return <ChooseIdentity identities={[]} />
    })
    .add('SettingsUI', () => {
        function D(props: { x: ValueRef<unknown> }) {
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
