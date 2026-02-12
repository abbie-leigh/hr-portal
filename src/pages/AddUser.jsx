import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import UserAttributesTable from "../components/UserAttributesTable";
import { userFields } from "../constants/userFields";
import { createUser, getAllUsers, getDepartments, getRoles } from "../services/api";
import { getValueByPath, setValueByPath } from "../utils/objectPath";
import { SparklesIcon } from "@heroicons/react/24/outline";

const numericFields = new Set(["salary", "yearlyLeaveBalance"]);
const dateFields = new Set(["startDate", "endDate"]);
const readOnlyFields = new Set(["id", "networkUsername", "isRegistered", "active", "networkPassword"]);
const requiredFields = new Set(userFields.map((field) => field.path));
requiredFields.delete("networkPassword");
requiredFields.delete("photo");

const emptyUser = {
    id: "",
    firstName: "",
    lastName: "",
    address: {
        addressLine1: "",
        city: "",
        state: "",
        zipCode: "",
    },
    startDate: "",
    endDate: "",
    active: true,
    title: "",
    department: "",
    managerId: "MGR-01",
    salary: 100000,
    yearlyLeaveBalance: 160,
    role: "employee",
    networkUsername: "",
    networkPassword: "",
    photo: "",
    isRegistered: false,
};

function buildUsername(firstName, lastName) {
    if (!firstName || !lastName) return "";
    return `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, "");
}

function getRolePrefix(role) {
    switch (role) {
        case "manager":
            return "MGR";
        case "ceo":
            return "CEO";
        case "hr-representative":
            return "HRR";
        default:
            return "EMP";
    }
}

function getNextEmployeeId(role, users) {
    const prefix = getRolePrefix(role);
    const matches = users
        .map((user) => user.id)
        .filter((id) => typeof id === "string" && id.startsWith(`${prefix}-`))
        .map((id) => {
            const num = Number(id.split("-")[1]);
            return Number.isNaN(num) ? 0 : num;
        });
    const nextNumber = (matches.length ? Math.max(...matches) : 0) + 1;
    return `${prefix}-${String(nextNumber).padStart(2, "0")}`;
}

export default function AddUser() {
    const [form, setForm] = useState(emptyUser);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        async function loadRoles() {
            try {
                const data = await getRoles();
                if (isMounted) {
                    setRoles(data);
                }
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to load roles.";
                if (isMounted) {
                    setError(message);
                }
            }
        }

        async function loadDepartments() {
            try {
                const data = await getDepartments();
                if (isMounted) {
                    setDepartments(data);
                }
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to load departments.";
                if (isMounted) {
                    setError(message);
                }
            }
        }

        async function loadUsers() {
            try {
                const data = await getAllUsers();
                if (isMounted) {
                    setUsers(data);
                }
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to load users.";
                if (isMounted) {
                    setError(message);
                }
            }
        }

        loadRoles();
        loadDepartments();
        loadUsers();
        return () => {
            isMounted = false;
        };
    }, []);

    const roleOptions = roles
        .map((role) => {
            if (typeof role === "string") return { value: role, label: role };
            if (role && typeof role === "object") {
                const value = role.id ?? role.role ?? role.name;
                if (!value) return null;
                return { value, label: role.name ?? value };
            }
            return null;
        })
        .filter(Boolean);
    const departmentOptions = departments
        .map((department) => {
            if (typeof department === "string") return { value: department, label: department };
            if (department && typeof department === "object") {
                const value = department.id ?? department.name;
                if (!value) return null;
                return { value, label: department.name ?? value };
            }
            return null;
        })
        .filter(Boolean);

    useEffect(() => {
        const username = buildUsername(form.firstName, form.lastName);
        const id = getNextEmployeeId(form.role, users);

        setForm((prev) => {
            let changed = false;
            const next = { ...prev };

            if (username && prev.networkUsername !== username) {
                next.networkUsername = username;
                changed = true;
            }
            if (id && prev.id !== id) {
                next.id = id;
                changed = true;
            }
            return changed ? next : prev;
        });
    }, [form.firstName, form.lastName, form.role, users]);

    function updateField(path, value) {
        setForm((prev) => setValueByPath(prev, path, value));
    }

    async function handleSubmit() {
        setIsSaving(true);
        setError("");

        try {
            for (const fieldPath of requiredFields) {
                const value = getValueByPath(form, fieldPath);
                if (value === undefined || value === null || value === "") {
                    setError("Please fill out all required fields.");
                    setIsSaving(false);
                    return;
                }
            }

            const payload = { ...form };
            numericFields.forEach((field) => {
                const raw = getValueByPath(payload, field);
                const parsed = Number(raw);
                payload[field] = Number.isNaN(parsed) ? 0 : parsed;
            });

            await createUser(payload);
            navigate("/user-management");
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to create user.";
            setError(message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
            <Container>
                <div className="mx-auto w-full max-w-5xl py-6">
                    <Link to="/user-management" className="px-3 text-sm text-slate-500 hover:text-slate-700">
                        Back to users
                    </Link>

                    <header className="flex items-center mt-4">
                        <h1 className="text-2xl font-semibold text-slate-700 px-2">New User!</h1>
                            <SparklesIcon className="h-9 w-9 text-slate-600" aria-hidden="true" />
                    </header>

                    {error ? (
                        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </div>
                    ) : null}

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <UserAttributesTable
                            fields={userFields}
                            renderValue={(field) => {
                                const value = getValueByPath(form, field.path);
                                if (field.path === "role") {
                                    return (
                                        <select
                                            value={value ?? ""}
                                            onChange={(event) => updateField(field.path, event.target.value)}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                        >
                                            <option value="" disabled>
                                                Select role
                                            </option>
                                            {roleOptions.map((role) => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                    );
                                }

                                if (field.path === "department") {
                                    return (
                                        <select
                                            value={value ?? ""}
                                            onChange={(event) => updateField(field.path, event.target.value)}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                        >
                                            <option value="" disabled>
                                                Select department
                                            </option>
                                            {departmentOptions.map((department) => (
                                                <option key={department.value} value={department.value}>
                                                    {department.label}
                                                </option>
                                            ))}
                                        </select>
                                    );
                                }

                                if (readOnlyFields.has(field.path)) {
                                    return (
                                        <span className="text-sm text-slate-500">
                                            {value === undefined || value === null || value === ""
                                                ? "--"
                                                : String(value)}
                                        </span>
                                    );
                                }

                                const inputType = dateFields.has(field.path)
                                    ? "date"
                                    : numericFields.has(field.path)
                                        ? "number"
                                        : "text";

                                return (
                                    <input
                                        type={inputType}
                                        value={value ?? ""}
                                        onChange={(event) => updateField(field.path, event.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />
                                );
                            }}
                        />

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <Link
                                to="/user-management"
                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="inline-flex items-center justify-center rounded-lg cursor-pointer bg-slate-500 opacity:700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
                            >
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
