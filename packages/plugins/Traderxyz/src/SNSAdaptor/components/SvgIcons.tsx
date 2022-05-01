export const CheckIcon = (): JSX.Element => {
    return (
        <svg
            style={{
                position: 'absolute',
                display: 'block',
                alignItems: 'center',
                right: '0px',
                top: '0px',
                borderRadius: '100%',
                height: '32px',
                width: '32px',
                background: 'rgb(153, 255, 120)',
                border: '2px solid rgb(255, 255, 255)',
                boxShadow: 'rgb(0 0 0 / 4%) 0px 6px 40px, rgb(0 0 0 / 2%) 0px 3px 6px',
            }}
            viewBox="0 0 2 2"
            xmlns="http://www.w3.org/2000/svg">
            <ellipse
                style={{
                    fill: 'rgb(153, 255, 120)',
                    stroke: '0px rgb(255,255,255)',
                }}
                cx="1.026"
                cy="0.979"
                rx="0.899"
                ry="0.899"
            />
            <path
                fill="#000"
                d="M 0.521 0.988 L 0.623 0.881 L 0.827 1.035 C 1.004 0.838 1.234 0.697 1.489 0.627 L 1.54 0.729 C 1.54 0.729 1.053 0.932 0.818 1.37 L 0.521 0.988 Z"
            />
        </svg>
    )
}
