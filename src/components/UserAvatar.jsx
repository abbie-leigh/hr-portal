import { useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";

export default function UserAvatar({
    photo,
    alt,
    sizeClassName = "h-14 w-14",
    iconClassName = "text-slate-400",
    className = "",
}) {
    const [isError, setIsError] = useState(false);
    const shouldShowImage = Boolean(photo) && !isError;

    return (
        <div
            className={`${sizeClassName} overflow-hidden rounded-full border border-slate-200 bg-slate-100 ${className}`}
        >
            {shouldShowImage ? (
                <img
                    src={`/photos/${photo}`}
                    alt={alt}
                    className="h-full w-full object-cover"
                    onError={() => setIsError(true)}
                />
            ) : (
                <UserCircleIcon className={`h-full w-full ${iconClassName}`} aria-hidden="true" />
            )}
        </div>
    );
}
