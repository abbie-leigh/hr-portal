import { useEffect, useState } from "react";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Container from "../components/Container";
import {
    createLeaveRequest,
    deleteLeaveRequest,
    findUserById,
    findUserByUsername,
    getLeaveRequestsForUser,
} from "../services/api";
import { calculateBusinessHours, parseLocalDate } from "../utils/dateUtils";

function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(value) {
    const date = parseLocalDate(value) ?? new Date(value);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getStatusStyles(status) {
    switch (status?.toLowerCase()) {
        case "approved":
            return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "denied":
            return "bg-rose-100 text-rose-700 border-rose-200";
        case "pending":
            return "bg-amber-100 text-amber-700 border-amber-200";
        default:
            return "bg-slate-100 text-slate-600 border-slate-200";
    }
}

function getStatusLabel(status) {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export default function EmployeeDashboard() {
    const currentUser = useSelector((state) => state.auth.currentUser);
    const [employee, setEmployee] = useState(null);
    const [manager, setManager] = useState(null);
    const [requests, setRequests] = useState([]);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRequest, setNewRequest] = useState({ startDate: "", endDate: "" });
    const sortedRequests = [...requests].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    const usedHours = requests
        .filter((request) => request.status === "approved" || request.status === "Approved")
        .reduce((total, request) => total + request.totalHours, 0);
    const remainingBalance = employee ? employee.yearlyLeaveBalance - usedHours : 0;

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            if (!currentUser?.networkUsername) return;
            const user = await findUserByUsername(currentUser.networkUsername);
            if (!isMounted) return;
            setEmployee(user);

            const [managerRecord, requestList] = await Promise.all([
                findUserById(user.managerId),
                getLeaveRequestsForUser(user.networkUsername),
            ]);
            if (!isMounted) return;
            setManager(managerRecord);
            setRequests(requestList);
        }

        loadData();
        return () => {
            isMounted = false;
        };
    }, [currentUser]);

    function openCancelModal(request) {
        setSelectedRequest(request);
        setIsCancelModalOpen(true);
    }

    function closeCancelModal() {
        setIsCancelModalOpen(false);
        setSelectedRequest(null);
    }

    function openAddModal() {
        setNewRequest({ startDate: "", endDate: "" });
        setIsAddModalOpen(true);
    }

    function closeAddModal() {
        setIsAddModalOpen(false);
    }

    function handleAddFormChange(e) {
        const { name, value } = e.target;
        setNewRequest((prev) => ({ ...prev, [name]: value }));
    }

    async function deleteRequest() {
        if (!selectedRequest?.id) {
            return;
        }
        await deleteLeaveRequest(selectedRequest.id);
        setRequests((prev) => prev.filter((request) => request.id !== selectedRequest.id));
    }

    async function submitAddRequest() {
        const totalHours = calculateBusinessHours(newRequest.startDate, newRequest.endDate);
        if (!newRequest.startDate || !newRequest.endDate || totalHours <= 0) {
            return;
        }

        if (!employee) return;
        const created = await createLeaveRequest(
            employee.id,
            newRequest.startDate,
            newRequest.endDate,
            totalHours
        );
        setRequests((prev) => [created, ...prev]);
        closeAddModal();
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (!employee || !manager) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
                <Container>
                    <div className="mx-auto w-full max-w-5xl py-12 text-slate-600">
                        Loading dashboard...
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
            <Container>
                <div className="mx-auto w-full max-w-5xl">

                    {/* Welcome Header */}
                    <header className="mb-8">
                        <h1 className="flex items-center text-3xl font-semibold text-slate-700">
                            <span className="px-2">Hello, {employee.firstName}!</span>
                            <SparklesIcon className="h-9 w-9 text-indigo-500" aria-hidden="true" />
                        </h1>
                    </header>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                        {/* Employee Information */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-700">Employee Information</h2>
                            <div className="mt-4 overflow-hidden rounded-lg border border-slate-100">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <tbody>
                                        <InfoRow label="Name">{employee.firstName} {employee.lastName}</InfoRow>
                                        <InfoRow label="Username">{employee.networkUsername}</InfoRow>
                                        <InfoRow label="Address">
                                            <p>{employee.address.addressLine1}</p>
                                            <p>{employee.address.city}, {employee.address.state}{" "}{employee.address.zipCode}</p>
                                        </InfoRow>
                                        <InfoRow label="Title">{employee.title}</InfoRow>
                                        <InfoRow label="Department">{employee.department}</InfoRow>
                                        <InfoRow label="Manager">{manager.firstName} {manager.lastName}</InfoRow>
                                        <InfoRow label="Salary">{formatCurrency(employee.salary)}</InfoRow>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Time Off Requests */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold text-slate-700">Time Off Requests</h2>
                                <button
                                    type="button"
                                    onClick={openAddModal}
                                    className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    New Request
                                </button>
                            </div>
                            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                    Remaining Balance
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-slate-700">
                                    {remainingBalance} hours
                                </p>
                            </div>

                            {/* Requests Table */}
                            <div className="mt-4 overflow-hidden rounded-lg border border-slate-100">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                                        <tr>
                                            <th className="px-3 py-2">Start</th>
                                            <th className="px-3 py-2">End</th>
                                            <th className="px-2 py-2">Hours</th>
                                            <th className="px-3 py-2">Status</th>
                                            <th className="px-2 py-2" aria-hidden="true"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedRequests.map((request) => (
                                            <tr
                                                key={`${request.startDate}-${request.endDate}-${request.status}`}
                                                className="border-t border-slate-100"
                                            >
                                                <td className="px-2 py-3">
                                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                        {formatDate(request.startDate)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3">
                                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                        {formatDate(request.endDate)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3">{request.totalHours}</td>
                                                <td className="px-2 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyles(
                                                            request.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(request.status)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => openCancelModal(request)}
                                                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:text-rose-600 hover:bg-rose-100 hover:border-rose-200"
                                                        aria-label="Cancel request"
                                                    >
                                                        <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </Container>

            {!isCancelModalOpen ? null : (
                <CancelModal
                    request={selectedRequest}
                    onClose={closeCancelModal}
                    onDelete={async () => {
                        await deleteRequest();
                        closeCancelModal();
                    }}
                />
            )}
            {!isAddModalOpen ? null : (
                <AddTimeOffRequestModal
                    form={newRequest}
                    onChange={handleAddFormChange}
                    onClose={closeAddModal}
                    onSubmit={submitAddRequest}
                    remainingBalance={remainingBalance}
                    calculateBusinessHours={calculateBusinessHours}
                />
            )}
        </div>
    );
}

function InfoRow({ label, children }) {
    return (
        <tr className="border-t border-slate-100">
            <th className="w-32 bg-slate-50 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
                {label}
            </th>
            <td className="px-4 py-3 text-slate-700">{children}</td>
        </tr>
    );
}

function CancelModal({ request, onClose, onDelete }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="fixed inset-0 bg-slate-900/40"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cancel-request-title"
            >
                <p className="mt-2 text-m text-slate-600">
                    Are you sure you'd like to delete this request?
                </p>
                <div className="mt-6 grid w-full grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={onDelete}
                        className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                    >
                        Delete
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddTimeOffRequestModal({
    form,
    onChange,
    onClose,
    onSubmit,
    remainingBalance,
    calculateBusinessHours,
}) {
    const requestedHours = calculateBusinessHours(form.startDate, form.endDate);
    const updatedBalance = Math.max(remainingBalance - requestedHours, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="fixed inset-0 bg-slate-900/40"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-request-title"
            >
                <h3 id="add-request-title" className="text-lg font-semibold text-slate-700">
                    New Time Off Request
                </h3>
                <div className="mt-4 space-y-4">
                    <div>
                        <label
                            className="text-xs uppercase tracking-wide text-slate-400"
                            htmlFor="startDate"
                        >
                            Start Date
                        </label>
                        <input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={form.startDate}
                            onChange={onChange}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                    <div>
                        <label
                            className="text-xs uppercase tracking-wide text-slate-400"
                            htmlFor="endDate"
                        >
                            End Date
                        </label>
                        <input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={form.endDate}
                            onChange={onChange}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Total Hours</p>
                        <p className="mt-1 text-lg font-semibold text-slate-700">{requestedHours}</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Remaining Balance</p>
                        <p className="mt-1 text-lg font-semibold text-slate-700">
                            {updatedBalance} hours
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid w-full grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
