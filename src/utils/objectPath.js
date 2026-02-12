export function getValueByPath(source, path) {
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), source);
}

export function setValueByPath(source, path, value) {
    const keys = path.split(".");
    const result = Array.isArray(source) ? [...source] : { ...source };
    let cursor = result;

    keys.forEach((key, index) => {
        if (index === keys.length - 1) {
            cursor[key] = value;
            return;
        }

        const next = cursor[key];
        cursor[key] = Array.isArray(next) ? [...next] : { ...(next || {}) };
        cursor = cursor[key];
    });

    return result;
}
