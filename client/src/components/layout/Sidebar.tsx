"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ListChecks,
    CalendarPlus,
    BookOpen,
    Settings,
    Users,
    ChevronRight,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

const navItems = [
    {
        href: "/meetings",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
    },
    {
        href: "/meetings/list",
        label: "All Meetings",
        icon: ListChecks,
    },
    {
        href: "/meetings/schedule",
        label: "Schedule Meeting",
        icon: CalendarPlus,
    },
];

const secondaryItems = [
    { href: "#", label: "Committees", icon: Users },
    { href: "#", label: "Reports", icon: BookOpen },
    { href: "#", label: "Settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-base-200 border-r border-base-300">
            {/* Brand */}
            <div className="p-5 border-b border-base-300">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-content font-bold text-sm">A</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-base-content text-sm leading-tight">APPNA</h1>
                        <p className="text-xs text-base-content/60 leading-tight">Meeting Portal</p>
                    </div>
                </div>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest px-3 py-2">
                    Meetings
                </p>
                {navItems.map(({ href, label, icon: Icon, exact }) => (
                    <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                            isActive(href, exact)
                                ? "bg-primary text-primary-content shadow-sm"
                                : "text-base-content/70 hover:bg-base-300 hover:text-base-content"
                        )}
                    >
                        <Icon
                            size={16}
                            className={clsx(
                                "flex-shrink-0",
                                isActive(href, exact)
                                    ? "text-primary-content"
                                    : "text-base-content/50 group-hover:text-base-content"
                            )}
                        />
                        <span className="flex-1">{label}</span>
                        {isActive(href, exact) && (
                            <ChevronRight size={14} className="text-primary-content/70" />
                        )}
                    </Link>
                ))}

                <div className="pt-4">
                    <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest px-3 py-2">
                        Management
                    </p>
                    {secondaryItems.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={label}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-base-content/50 hover:bg-base-300 hover:text-base-content transition-all duration-150 cursor-not-allowed opacity-60"
                        >
                            <Icon size={16} className="flex-shrink-0" />
                            <span>{label}</span>
                            <span className="ml-auto badge badge-ghost badge-xs">Soon</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* User Profile */}
            <div className="p-3 border-t border-base-300">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-base-300 cursor-pointer transition-all">
                    <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-8 h-8">
                            <span className="text-xs font-bold">AK</span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-base-content truncate">Dr. Ahmed Khan</p>
                        <p className="text-xs text-base-content/50 truncate">President</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0">
                <SidebarContent />
            </aside>

            {/* Mobile Hamburger */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 btn btn-sm btn-ghost btn-square"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={clsx(
                    "lg:hidden fixed top-0 left-0 z-50 h-full w-64 transition-transform duration-300",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </aside>
        </>
    );
}
