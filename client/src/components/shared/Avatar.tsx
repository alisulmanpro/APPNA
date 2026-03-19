import { getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
    name: string;
    src?: string | null;
    size?: "xs" | "sm" | "md" | "lg";
}

const sizeMap = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
};

export default function Avatar({ name, src, size = "sm" }: AvatarProps) {
    const initials = getInitials(name);
    const sizeClass = sizeMap[size];

    return (
        <div className="avatar placeholder">
            <div className={`bg-primary text-primary-content rounded-full ${sizeClass} font-semibold flex items-center justify-center relative overflow-hidden`}>
                {src ? (
                    <Image src={src} alt={name} fill className="object-cover" />
                ) : (
                    <span>{initials}</span>
                )}
            </div>
        </div>
    );
}
