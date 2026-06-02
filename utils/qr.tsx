
export function QrSvg({ dark = "#27272a", light = "#09090b", dot = "#a1a1aa" }: {
    dark?: string; light?: string; dot?: string;
}) {
    const modules: [number, number][] = [
        [34, 4], [38, 4], [34, 8], [42, 8], [38, 12], [42, 12], [34, 16], [38, 16], [42, 16],
        [34, 24], [42, 24], [34, 28], [38, 28], [42, 28], [46, 28], [50, 28],
        [34, 34], [38, 34], [42, 34], [46, 34], [50, 34], [54, 34], [58, 34], [62, 34], [66, 34], [70, 34], [74, 34],
        [34, 38], [42, 38], [50, 38], [58, 38], [66, 38], [74, 38],
        [34, 42], [38, 42], [46, 42], [54, 42], [62, 42], [70, 42],
        [46, 52], [50, 52], [58, 52], [66, 52], [74, 52],
        [46, 56], [54, 56], [62, 56], [70, 56],
        [46, 60], [50, 60], [58, 60], [66, 60], [74, 60],
        [46, 64], [54, 64], [62, 64], [70, 64],
        [46, 68], [50, 68], [58, 68], [62, 68], [70, 68], [74, 68],
        [46, 72], [54, 72], [66, 72], [74, 72],
    ];
    return (
        <svg viewBox="0 0 80 80" className="h-full w-full" fill="none" >
            <rect x="4" y="4" width="24" height="24" rx="3" fill={dark} />
            <rect x="8" y="8" width="16" height="16" rx="1" fill={light} />
            <rect x="11" y="11" width="10" height="10" rx="1" fill={dot} />
            <rect x="52" y="4" width="24" height="24" rx="3" fill={dark} />
            <rect x="56" y="8" width="16" height="16" rx="1" fill={light} />
            <rect x="59" y="11" width="10" height="10" rx="1" fill={dot} />
            <rect x="4" y="52" width="24" height="24" rx="3" fill={dark} />
            <rect x="8" y="56" width="16" height="16" rx="1" fill={light} />
            <rect x="11" y="59" width="10" height="10" rx="1" fill={dot} />
            {
                modules.map(([x, y], i) => (
                    <rect key={i} x={x} y={y} width="4" height="4" rx="0.5" fill={dot} />
                ))
            }
        </svg>
    );
}
