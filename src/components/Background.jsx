import { UserGroupIcon } from "@heroicons/react/24/outline"

export default function AuthBackground({ children }) {
    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-r from-indigo-50 to-indigo-100 flex items-center justify-center overflow-hidden">

            {/* Icon Pattern */}
            <div className="absolute justify-items-center items-center inset-0 px-4 py-4 grid grid-cols-8 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-12 opacity-20 pointer-events-none">
                {Array.from({ length: 192 }).map((_, i) => (
                    <UserGroupIcon
                        key={i}
                        className={`w-6 h-6 text-indigo-400 ${i % 2 === 0 ? "rotate-12" : "-rotate-12"}`}
                    />
                ))}
            </div>

            {/* 🔥 Soft Overlay */}
            <div className="absolute inset-0 bg-white/40 z-0"></div>


            {/* Card */}
            <div className="relative bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow">
                {children}
            </div>

        </div>
    )
}
