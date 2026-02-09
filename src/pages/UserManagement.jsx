import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import { getAllUsers } from "../services/api";
import UserAvatar from "../components/UserAvatar";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

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

        loadUsers();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
            <Container>
                <div className="mx-auto w-full max-w-6xl">
                    <header className="mb-8">
                        <h1 className="px-2 text-3xl font-semibold text-slate-700">Users</h1>
                    </header>

                    {error ? (
                        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {users.map((user) => (
                            <Link
                                key={user.id}
                                to={`/user-management/${user.id}`}
                                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <UserAvatar
                                        photo={user.photo}
                                        alt={`${user.firstName} ${user.lastName}`}
                                    />
                                    <div>
                                        <p className="text-base font-semibold text-slate-700">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="text-sm text-slate-500">{user.title}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    );
}
