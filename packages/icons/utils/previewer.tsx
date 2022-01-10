import { MaskIconPaletteContext } from './MaskIconPaletteContext'
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
                        <td
                            children={
                                <MaskIconPaletteContext.Provider value="dim">
                                    <C className="black" />
                                </MaskIconPaletteContext.Provider>
                            }
                        />
                    </tr>
                ))}
            </table>
        </details>
    )
}
