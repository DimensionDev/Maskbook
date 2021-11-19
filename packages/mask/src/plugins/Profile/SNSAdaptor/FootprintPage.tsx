interface FootprintPageProps {}
export function FootprintPage(props: FootprintPageProps) {
    return (
        <>
            <head>
                <link rel="stylesheet" href={new URL('../tailwind.css', import.meta.url).toString()} />
            </head>
            <div className="bg-gray-300">hello tailwind</div>
        </>
    )
}
