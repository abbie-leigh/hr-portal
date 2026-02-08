import { useState } from "react";
import Container from "../components/Container";
import AuthCard from "../components/AuthCard";

export default function Signup() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (!form.username.trim() || !form.password.trim()) {
            setError("Please enter both a username and password.");
            return;
        }

        setError("");
        console.log("Signup submitted:", form);
    }

    return (
        /* Page background + overall height */
        <div className="min-h-[calc(100vh-4rem)] bg-indigo-50">
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
                            title="Welcome"
                            subtitle="Register for Employee Hub using your network username and password"
                            submitLabel="Sign up"
                            footerText="Already have an account?"
                            footerLinkText="Sign in"
                            footerLinkTo="/login"/>
                    </div>
                </div>
            </Container>
        </div>
    );
}
