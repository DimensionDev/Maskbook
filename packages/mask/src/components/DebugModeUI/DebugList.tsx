import { Fragment } from 'react'

type AcceptableDebuggerType = string | number | undefined | boolean
function F({ content, hint }: { hint: string; content: AcceptableDebuggerType }) {
    return String(content).length > 50 ? (
        <details>
            <summary>{hint}: </summary>
            {String(content)}
        </details>
    ) : (
        <li>
            <span style={{ userSelect: 'none', opacity: 0.6 }}>{hint}: </span>
            {String(content)}
        </li>
    )
}
export function DebugList(props: { items: readonly (readonly [string, AcceptableDebuggerType] | JSX.Element)[] }) {
    return (
        <div style={{ wordBreak: 'break-all', padding: '0 1em', margin: 0, background: 'black', color: 'white' }}>
            {props.items.map((x) => (
                <Fragment key={x.toString()}>
                    {Array.isArray(x) ? <F key={x[0]} hint={x[0]} content={x[1]} /> : x}
                </Fragment>
            ))}
        </div>
    )
}
