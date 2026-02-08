function Navbar() {
    return (
        <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <h1 className="text-lg font-semibold text-slate-700">
                    Employee Hub
                </h1>
                <div className="space-x-4">
                    <a href="/signup" className="text-slate-600 hover:text-slate-900">
                        Sign up
                    </a>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
