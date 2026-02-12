import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearCurrentUser } from "../store/authSlice";

const menuOptionClass = ({ isActive }) =>
    `rounded-md border border-slate-200 px-3 py-1.5 transition ${isActive
        ? "bg-slate-50 text-slate-700 border-slate-200"
        : "hover:bg-slate-50 hover:text-slate-800 border-white hover:border-slate-200"
    }`

function Navbar() {
    const currentUser = useSelector((state) => state.auth.currentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    function handleToggleMenu() {
        setIsMenuOpen((prev) => !prev);
    }

    function handleLogout() {
        dispatch(clearCurrentUser());
        setIsMenuOpen(false);
        navigate("/login");
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    const photoSrc = currentUser?.photo ? `/photos/${currentUser.photo}` : "";

    return (
        <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-lg font-semibold text-slate-700">
                    Employee Hub
                </Link>

                {currentUser?.role === "hr-representative" ? (
                    <div className="hidden items-center gap-4 text-sm font-medium text-slate-600 md:flex">
                        <NavLink to="/employee-dashboard" className={menuOptionClass}>
                            Profile
                        </NavLink>
                        <NavLink to="/user-management" className={menuOptionClass}>
                            User Management
                        </NavLink>
                        <NavLink to="/time-off-requests" className={menuOptionClass}>
                            Time Off Requests
                        </NavLink>
                    </div>
                ) : null}

                {currentUser ? (
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={handleToggleMenu}
                            className="flex items-center cursor-pointer gap-2 rounded-full border border-slate-400"
                            aria-haspopup="menu"
                            aria-expanded={isMenuOpen}
                        >
                            {photoSrc ? (
                                <img
                                    src={photoSrc}
                                    alt={`${currentUser.firstName} ${currentUser.lastName}`}
                                    className="h-10 w-10 rounded-full shadow-lg"
                                    onError={(event) => {
                                        event.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : null}
                        </button>

                        {isMenuOpen ? (
                            <div
                                className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white py-2 shadow-lg"
                                role="menu"
                            >
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="cursor-pointer w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                                    role="menuitem"
                                >
                                    Log out
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-sm font-medium">
                        <Link to="/login" className="text-slate-600 hover:text-slate-900">
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className="rounded-full bg-indigo-500 px-4 py-1.5 text-white hover:bg-indigo-600"
                        >
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
