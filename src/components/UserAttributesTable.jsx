export default function UserAttributesTable({
    fields,
    renderValue,
    renderActions,
}) {
    const splitIndex = Math.ceil(fields.length / 2);
    const columns = [fields.slice(0, splitIndex), fields.slice(splitIndex)];
    const hasActions = typeof renderActions === "function";

    return (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {columns.map((columnFields, columnIndex) => (
                <div
                    key={`column-${columnIndex}`}
                    className="overflow-hidden rounded-xl border border-slate-100"
                >
                    <table className="w-full text-left text-sm text-slate-600">
                        <tbody>
                            {columnFields.map((field) => (
                                <tr key={field.path} className="border-t border-slate-100">
                                    <th className="w-48 bg-slate-50 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
                                        {field.label}
                                    </th>
                                    <td className="px-4 py-3 text-slate-700">
                                        {renderValue(field)}
                                    </td>
                                    {hasActions ? (
                                        <td className="px-4 py-3 text-right">
                                            {renderActions(field)}
                                        </td>
                                    ) : null}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}
