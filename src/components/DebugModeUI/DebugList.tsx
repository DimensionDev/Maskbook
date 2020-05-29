import React from 'react'
const F = (props: { hint: string; content: string | number }) => (
    <li>
        <span style={{ userSelect: 'none', opacity: 0.6 }}>{props.hint}: </span>
        <span>{props.content}</span>
    </li>
)
export function DebugList(props: { items: readonly (readonly [string, string | number | undefined] | JSX.Element)[] }) {
    return (
        <ul style={{ wordBreak: 'break-all', padding: '0 1em', margin: 0, background: 'black', color: 'white' }}>
            {props.items.map((x) =>
                Array.isArray(x) ? <F key={x[0]} hint={x[0]} content={x[1] === undefined ? 'undefined' : x[1]} /> : x,
            )}
        </ul>
    )
}
