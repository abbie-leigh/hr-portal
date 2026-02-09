import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckIcon, PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Container from "../components/Container";
import { findUserById, updateUser } from "../services/api";
import UserAvatar from "../components/UserAvatar";

export default function UserProfile() {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [saveError, setSaveError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const fields = useMemo(
        () => [
            { label: "ID", path: "id" },
            { label: "First Name", path: "firstName" },
            { label: "Last Name", path: "lastName" },
            { label: "Address Line 1", path: "address.addressLine1" },
            { label: "City", path: "address.city" },
            { label: "State", path: "address.state" },
            { label: "Zip Code", path: "address.zipCode" },
            { label: "Start Date", path: "startDate" },
            { label: "End Date", path: "endDate" },
            { label: "Active", path: "active" },
            { label: "Title", path: "title" },
            { label: "Department", path: "department" },
            { label: "Manager ID", path: "managerId" },
            { label: "Salary", path: "salary" },
            { label: "Leave Balance", path: "yearlyLeaveBalance" },
            { label: "Role", path: "role" },
            { label: "Registered", path: "isRegistered" },
            { label: "Username", path: "networkUsername" },
            { label: "Password", path: "networkPassword" },
            { label: "Photo", path: "photo" },
        ],
        []
    );

    useEffect(() => {
        let isMounted = true;

        async function loadUser() {
            try {
                const data = await findUserById(userId);
                if (isMounted) {
                    setUser(data);
                }
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to load user.";
                if (isMounted) {
                    setError(message);
                }
            }
        }

        loadUser();
        return () => {
            isMounted = false;
        };
    }, [userId]);

    function getValueByPath(source, path) {
        return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), source);
    }

    function startEditing(path) {
        if (!user) return;
        const value = getValueByPath(user, path);
        setEditingField(path);
        setEditValue(value === undefined || value === null ? "" : String(value));
        setSaveError("");
    }

    function cancelEditing() {
        setEditingField(null);
        setEditValue("");
        setSaveError("");
    }

    async function saveField(path) {
        if (!user) return;
        setIsSaving(true);
        setSaveError("");

        try {
            let patch = {};
            if (path.startsWith("address.")) {
                const key = path.split(".")[1];
                patch = {
                    address: {
                        ...user.address,
                        [key]: editValue,
                    },
                };
            } else {
                patch = { [path]: editValue };
            }

            const updated = await updateUser(user.id, patch);
            setUser(updated);
            cancelEditing();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to save changes.";
            setSaveError(message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
            <Container>
                <div className="mx-auto w-full max-w-5xl py-6">
                    <Link to="/user-management" className="text-sm text-slate-500 hover:text-slate-700">
                        Back to users
                    </Link>

                    {error ? (
                        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </div>
                    ) : null}

                    {user ? (
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-wrap items-center gap-4">
                                <UserAvatar
                                    photo={user.photo}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    sizeClassName="h-16 w-16"
                                />
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-700">
                                        {user.firstName} {user.lastName}
                                    </h1>
                                    <p className="text-sm text-slate-500">{user.title}</p>
                                </div>
                            </div>

                            {saveError ? (
                                <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    {saveError}
                                </div>
                            ) : null}

                            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                                {[fields.slice(0, Math.ceil(fields.length / 2)), fields.slice(Math.ceil(fields.length / 2))].map(
                                    (columnFields, columnIndex) => (
                                        <div
                                            key={`column-${columnIndex}`}
                                            className="overflow-hidden rounded-xl border border-slate-100"
                                        >
                                            <table className="w-full text-left text-sm text-slate-600">
                                                <tbody>
                                                    {columnFields.map((field) => {
                                                        const value = getValueByPath(user, field.path);
                                                        const isEditing = editingField === field.path;

                                                        return (
                                                            <tr
                                                                key={field.path}
                                                                className="border-t border-slate-100"
                                                            >
                                                                <th className="w-36 bg-slate-50 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
                                                                    {field.label}
                                                                </th>
                                                                <td className="px-4 py-3 text-slate-700">
                                                                    {isEditing ? (
                                                                        <input
                                                                            type="text"
                                                                            value={editValue}
                                                                            onChange={(event) =>
                                                                                setEditValue(event.target.value)
                                                                            }
                                                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                                                        />
                                                                    ) : (
                                                                        <span>
                                                                            {value === undefined || value === null
                                                                                ? "—"
                                                                                : String(value)}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    {isEditing ? (
                                                                        <div className="flex justify-end gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={cancelEditing}
                                                                                className="inline-flex cursor-pointer h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                                                                disabled={isSaving}
                                                                                aria-label="Cancel"
                                                                            >
                                                                                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => saveField(field.path)}
                                                                                className="inline-flex cursor-pointer h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
                                                                                disabled={isSaving}
                                                                                aria-label="Save"
                                                                            >
                                                                                <CheckIcon className="h-4 w-4" aria-hidden="true" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => startEditing(field.path)}
                                                                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-50"
                                                                        >
                                                                            <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    ) : (
                        !error && (
                            <div className="mt-6 text-sm text-slate-500">Loading user...</div>
                        )
                    )}
                </div>
            </Container>
        </div>
    );
}
