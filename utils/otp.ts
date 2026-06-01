export function OtpInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.padEnd(6, " ").split("").slice(0, 6);

    function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace" && !digits[i].trim() && i > 0) {
            inputs.current[i - 1]?.focus();
        }
    }

    function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value.replace(/\D/g, "").slice(-1);
        const next = digits.map((d, idx) => (idx === i ? val : d)).join("").replace(/ /g, "");
        onChange(next);
        if (val && i < 5) inputs.current[i + 1]?.focus();
    }

    function handlePaste(e: React.ClipboardEvent) {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted) {
            onChange(pasted);
            inputs.current[Math.min(pasted.length, 5)]?.focus();
        }
        e.preventDefault();
    }

    return (
        <div className= "flex gap-3 justify-center" >
        {
            Array.from({ length: 6 }).map((_, i) => (
                <input
                    key= { i }
                    ref = {(el) => { inputs.current[i] = el; }}
    type = "text"
    inputMode = "numeric"
    maxLength = { 1}
    value = { digits[i] === " " ? "" : digits[i] }
    onChange = {(e) => handleChange(i, e)
}
onKeyDown = {(e) => handleKeyDown(i, e)}
onPaste = { handlePaste }
className = "h-12 w-12 rounded-xl border border-zinc-800 bg-zinc-950 text-center text-lg font-semibold text-white outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 caret-transparent"
    />
            ))}
</div>
    );
}