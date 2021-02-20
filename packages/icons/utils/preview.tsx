import type {} from 'react/experimental'
import {} from 'react'

/** @internal */
export interface IconPreviewProps {
    icons: Record<string, React.ComponentType<any>>
    title: string
}
/** @internal */
export function IconPreview(props: IconPreviewProps) {
    return (
        <details open>
            <summary>{props.title}</summary>
            <table>
                {Object.entries(props.icons).map(([name, C]) => (
                    <tr key={name}>
                        <td>{name}</td>
                        <td children={<C />} />
                        <td children={<C className="black" />} />
                    </tr>
                ))}
            </table>
        </details>
    )
}
