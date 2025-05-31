import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/pro-regular-svg-icons";
import 'animate.css';

export default function Signup() {
    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        username: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorAnimKey, setErrorAnimKey] = useState(0); // Used to re-trigger animation

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Signup failed");
            }

            window.location.href = data.location;
        } catch (err) {
            setError(err.message);
            setErrorAnimKey(prev => prev + 1); // Force re-trigger
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

            {["firstname", "lastname", "username"].map((field) => (
                <div className="mb-4" key={field}>
                    <label htmlFor={field} className="block text-sm font-medium mb-1 capitalize">
                        {field}
                    </label>
                    <input
                        type="text"
                        id={field}
                        name={field}
                        placeholder={field}
                        required
                        value={form[field]}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            ))}

            <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="Password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                    >
                        <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                    </button>
                </div>
            </div>

            {error && (
                <p
                    key={errorAnimKey}
                    className="text-red-500 text-sm mb-4 animate__animated animate__bounce"
                >
                    {error}
                </p>
            )}

            <button
                onClick={handleSubmit}
                className={`w-full py-2 px-4 text-white font-medium rounded transition-colors ${
                    isLoading || Object.values(form).some(v => !v)
                        ? 'bg-blue-300'
                        : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={isLoading || Object.values(form).some(v => !v)}
            >
                {isLoading ? "Creating account..." : "Sign Up"}
            </button>
        </div>
    );
}
