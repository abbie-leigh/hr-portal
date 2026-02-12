import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Container from "../components/Container";
import AuthCard from "../components/AuthCard";
import AuthBackground from "../components/Background";
import { isUserRegistered, registerUser, userExists } from "../services/api";
import { setCurrentUser } from "../store/authSlice";

export default function Signup() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const trimmedUsername = form.username.trim();
        const trimmedPassword = form.password.trim();

        if (!trimmedUsername || !trimmedPassword) {
            setError("Please enter both a username and password.");
            return;
        }

        const exists = await userExists(trimmedUsername);
        if (!exists) {
            setError("A user does not exist with that username. Please contact your manager or HR representative.");
            return;
        }

        const alreadyRegistered = await isUserRegistered(trimmedUsername);
        if (alreadyRegistered) {
            setError("You have already registered! Please sign in instead");
            return;
        }

        try {
            const user = await registerUser(trimmedUsername, trimmedPassword);
            setError("");
            dispatch(setCurrentUser(user));
            navigate("/employee-dashboard");
        } catch (err) {
            const message = err instanceof Error
                ? err.message
                : "Registration failed. Please try again.";
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
                            title="Welcome"
                            subtitle="Register for Employee Hub using your network username and a unique password"
                            submitLabel="Register"
                            footerText="Already registered?"
                            footerLinkText="Sign in"
                            footerLinkTo="/login" />
                    </div>
                </div>
            </Container>
        </AuthBackground>
    );
}
