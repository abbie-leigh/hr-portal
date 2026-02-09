export function parseLocalDate(value) {
    if (!value) return null;

    if (value instanceof Date) {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    if (typeof value !== "string") return null;

    if (value.includes("T")) {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return null;
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }

    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
}

export function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

export function calculateBusinessHours(startDate, endDate) {
    if (!startDate || !endDate) return 0;

    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    if (!start || !end) return 0;
    if (start > end) return 0;

    let hours = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
        if (!isWeekend(cursor)) {
            hours += 8;
        }
        cursor.setDate(cursor.getDate() + 1);
    }
    return hours;
}

function formatTimezoneOffset(minutesOffset) {
    const sign = minutesOffset <= 0 ? "+" : "-";
    const abs = Math.abs(minutesOffset);
    const hours = String(Math.floor(abs / 60)).padStart(2, "0");
    const minutes = String(abs % 60).padStart(2, "0");
    return `${sign}${hours}:${minutes}`;
}

export function toLocalIsoDate(value) {
    const date = parseLocalDate(value);
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const offset = formatTimezoneOffset(date.getTimezoneOffset());

    return `${year}-${month}-${day}T00:00:00${offset}`;
}
