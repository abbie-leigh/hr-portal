import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Container from "../components/Container";
import AuthCard from "../components/AuthCard";
import AuthBackground from "../components/Background";
import { setCurrentUser } from "../store/authSlice";
import { findUserByUsername } from "../services/api";

export default function Login() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState(""); // reserve space for later validation/API errors
    const dispatch = useDispatch();
    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Basic front-end validation (keep simple for now)
        if (!form.username.trim() || !form.password.trim()) {
            setError("Please enter both a username and password.");
            return;
        }

        try {
            const user = await findUserByUsername(form.username.trim());
            if (!user) {
                setError("No user found with that username.");
                return;
            }
            if (!user.isRegistered) {
                setError("You are not registered yet. Please sign up first.");
                return;
            }
            if (user.networkPassword !== form.password) {
                setError("Incorrect password. Please try again.");
                return;
            }

            setError("");
            dispatch(setCurrentUser(user));
            navigate("/employee-dashboard");
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Login failed. Please try again.";
            setError(message);
        }
    }

    return (
        /* Page background + overall height */
        <AuthBackground>
            {/* Centered content container (consistent site width) */}
            <Container>
                {/* Login area width */}
                <div className="mx-auto w-full max-w-md">

                    {/* Login Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <AuthCard
                            form={form}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                            error={error}
                            title="Welcome Back"
                            subtitle="Sign in using your network username and Employee Hub password"
                            submitLabel="Sign in"
                            footerText="Haven't signed in yet?"
                            footerLinkText="Register"
                            footerLinkTo="/register" />
                    </div>
                </div>
            </Container>
        </AuthBackground>
    );
}
