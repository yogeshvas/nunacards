export function flag(iso: string) {
    return iso
        .toUpperCase()
        .split("")
        .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
        .join("");
}
