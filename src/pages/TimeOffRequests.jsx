import { useEffect, useMemo, useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Container from "../components/Container";
import { getAllLeaveRequests, getAllUsers, updateLeaveRequest } from "../services/api";
import { parseLocalDate } from "../utils/dateUtils";

function formatDate(value) {
    const date = parseLocalDate(value) ?? new Date(value);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function TimeOffRequests() {
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            try {
                const [requestData, userData] = await Promise.all([
                    getAllLeaveRequests(),
                    getAllUsers(),
                ]);
                if (!isMounted) return;
                setRequests(requestData);
                setUsers(userData);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to load requests.";
                if (isMounted) {
                    setError(message);
                }
            }
        }

        loadData();
        return () => {
            isMounted = false;
        };
    }, []);

    const userLookup = useMemo(() => {
        const map = new Map();
        users.forEach((user) => {
            map.set(user.id, user);
        });
        return map;
    }, [users]);

    const pendingRequests = requests.filter(
        (request) => String(request.status || "").toLowerCase() === "pending"
    );
    const resolvedRequests = requests.filter(
        (request) => String(request.status || "").toLowerCase() !== "pending"
    );

    const usedHoursByUser = useMemo(() => {
        const map = new Map();
        requests.forEach((request) => {
            const status = String(request.status || "").toLowerCase();
            if (status === "pending" || status === "approved") {
                const current = map.get(request.employeeId) ?? 0;
                map.set(request.employeeId, current + Number(request.totalHours || 0));
            }
        });
        return map;
    }, [requests]);

    function getRemainingHours(employeeId) {
        const user = userLookup.get(employeeId);
        if (!user) return "--";
        const used = usedHoursByUser.get(employeeId) ?? 0;
        const remaining = Number(user.yearlyLeaveBalance || 0) - used;
        return `${remaining} hours`;
    }

    async function updateStatus(requestId, status) {
        try {
            const updated = await updateLeaveRequest(requestId, { status });
            setRequests((prev) =>
                prev.map((request) => (request.id === requestId ? updated : request))
            );
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to update request.";
            setError(message);
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
            <Container>
                <div className="mx-auto w-full max-w-6xl">
                    <header className="px-2 mb-6">
                        <h1 className="text-3xl font-semibold text-slate-700">Time Off Requests</h1>
                    </header>

                    {error ? (
                        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </div>
                    ) : null}

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-700">Pending Approval</h2>
                        {pendingRequests.length === 0 ? (
                            <p className="mt-4 text-sm text-slate-500">
                                No pending requests right now.
                            </p>
                        ) : (
                            <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
                                <table className="w-full table-fixed text-left text-sm text-slate-600">
                                    <colgroup>
                                        <col className="w-[24%]" />
                                        <col className="w-[14%]" />
                                        <col className="w-[14%]" />
                                        <col className="w-[10%]" />
                                        <col className="w-[16%]" />
                                        <col className="w-[22%]" />
                                    </colgroup>
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                                        <tr>
                                            <th className="px-4 py-2">User</th>
                                            <th className="px-4 py-2">Start</th>
                                            <th className="px-4 py-2">End</th>
                                            <th className="px-4 py-2">Hours</th>
                                            <th className="px-4 py-2">Remaining</th>
                                            <th className="px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingRequests.map((request) => {
                                            const user = userLookup.get(request.employeeId);
                                            return (
                                                <tr key={request.id} className="border-t border-slate-100">
                                                    <td className="px-4 py-3 font-medium text-slate-700">
                                                        {user
                                                            ? `${user.firstName} ${user.lastName}`
                                                            : request.employeeId}
                                                    </td>
                                                    <td className="px-4 py-3">{formatDate(request.startDate)}</td>
                                                    <td className="px-4 py-3">{formatDate(request.endDate)}</td>
                                                    <td className="px-4 py-3">{request.totalHours}</td>
                                                    <td className="px-4 py-3">{getRemainingHours(request.employeeId)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                                Pending
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateStatus(request.id, "approved")}
                                                                className="inline-flex cursor-pointer h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                                                                aria-label="Approve request"
                                                            >
                                                                <CheckIcon className="h-4 w-4" aria-hidden="true" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateStatus(request.id, "denied")}
                                                                className="inline-flex cursor-pointer h-6 w-6 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                                                aria-label="Deny request"
                                                            >
                                                                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-700">History</h2>
                        {resolvedRequests.length === 0 ? (
                            <p className="mt-4 text-sm text-slate-500">
                                No approved or denied requests yet.
                            </p>
                        ) : (
                            <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
                                <table className="w-full table-fixed text-left text-sm text-slate-600">
                                    <colgroup>
                                        <col className="w-[24%]" />
                                        <col className="w-[14%]" />
                                        <col className="w-[14%]" />
                                        <col className="w-[10%]" />
                                        <col className="w-[16%]" />
                                        <col className="w-[22%]" />
                                    </colgroup>
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                                        <tr>
                                            <th className="px-4 py-2">User</th>
                                            <th className="px-4 py-2">Start</th>
                                            <th className="px-4 py-2">End</th>
                                            <th className="px-4 py-2">Hours</th>
                                            <th className="px-4 py-2">Remaining</th>
                                            <th className="px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resolvedRequests.map((request) => {
                                            const user = userLookup.get(request.employeeId);
                                            const status = String(request.status || "").toLowerCase();
                                            const badge =
                                                status === "approved"
                                                    ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                                                    : "border-rose-200 bg-rose-100 text-rose-700";

                                            return (
                                                <tr key={request.id} className="border-t border-slate-100">
                                                    <td className="px-4 py-3 font-medium text-slate-700">
                                                        {user
                                                            ? `${user.firstName} ${user.lastName}`
                                                            : request.employeeId}
                                                    </td>
                                                    <td className="px-4 py-3">{formatDate(request.startDate)}</td>
                                                    <td className="px-4 py-3">{formatDate(request.endDate)}</td>
                                                    <td className="px-4 py-3">{request.totalHours}</td>
                                                    <td className="px-4 py-3">{getRemainingHours(request.employeeId)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}>
                                                            {status === "approved" ? "Approved" : "Denied"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </Container>
        </div>
    );
}
