import { Link } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/outline";

export default function AuthCard({
    form,
    onChange,
    onSubmit,
    error = "",
    title = "Welcome Back",
    subtitle = "Sign in to Employee Hub using your network username and password",
    submitLabel = "Sign in",
    footerText = "Already have an account?",
    footerLinkText = "Sign up",
    footerLinkTo = "/signup",
}) {
    return <div>
        {/* Welcome text and user icon */}
        <header className="mb-6">
            <h1 className="flex items-center justify-center gap-2 text-3xl font-semibold text-slate-700">
                <span>{title}</span>
                <UserCircleIcon className="h-9 w-9 text-indigo-500" aria-hidden="true" />
            </h1>
            <p className="mt-3 text-sm text-slate-600 text-center">
                {subtitle}
            </p>
        </header>

        {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
            </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">

            {/* Username */}
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-500">
                    Username
                </label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={form.username}
                    onChange={onChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>

            {/* Password */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-500">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={onChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>

            {/* Sign In Button */}
            <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600">
                {submitLabel}
            </button>

            {/* Sign Up Prompt */}
            <p className="text-sm text-slate-600 text-center">
                {footerText}{" "}
                <Link
                    to={footerLinkTo}
                    className="font-medium text-indigo-500 hover:underline">
                    {footerLinkText}
                </Link>
            </p>

        </form>
    </div>
}
