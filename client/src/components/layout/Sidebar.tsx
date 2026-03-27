"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Building2,
    Calendar,
    ListChecks,
    CalendarPlus,
    Settings,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

const navGroups = [
    {
        label: "Overview",
        items: [
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        ],
    },
    {
        label: "Directory",
        items: [
            { href: "/members", label: "Members", icon: Users },
            { href: "/committees", label: "Committees", icon: Building2 },
        ],
    },
    {
        label: "Meetings",
        items: [
            { href: "/meetings", label: "Overview", icon: Calendar, exact: true },
            { href: "/meetings/list", label: "All Meetings", icon: ListChecks },
            { href: "/meetings/schedule", label: "Schedule Meeting", icon: CalendarPlus },
        ],
    },
    {
        label: "Management",
        items: [
            { href: "#", label: "Settings", icon: Settings, disabled: true },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-base-200 border-r border-base-300">
            {/* Brand */}
            <div className="p-5 border-b border-base-300">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm animate-fade-in">
                        <span className="text-primary-content font-bold text-sm tracking-widest">APP</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-base-content text-sm leading-tight tracking-tight">APPNA</h1>
                        <p className="text-xs text-base-content/60 leading-tight">Command Center</p>
                    </div>
                </Link>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
                {navGroups.map((group, idx) => (
                    <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest px-3 py-2">
                            {group.label}
                        </p>
                        <ul className="space-y-1">
                            {group.items.map(({ href, label, icon: Icon, exact, disabled }) => {
                                const active = isActive(href, exact);
                                return (
                                    <li key={label}>
                                        <Link
                                            href={disabled ? "#" : href}
                                            onClick={() => !disabled && setMobileOpen(false)}
                                            className={clsx(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                                active
                                                    ? "nav-item-active"
                                                    : disabled
                                                        ? "text-base-content/40 cursor-not-allowed opacity-60"
                                                        : "text-base-content/70 hover:bg-base-300/60 hover:text-base-content"
                                            )}
                                        >
                                            <Icon
                                                size={18}
                                                strokeWidth={active ? 2.5 : 2}
                                                className={clsx(
                                                    "flex-shrink-0 transition-transform duration-200",
                                                    active
                                                        ? "text-primary-content"
                                                        : "text-base-content/50 group-hover:text-base-content group-hover:scale-110"
                                                )}
                                            />
                                            <span className="flex-1 relative z-10">{label}</span>

                                            {disabled && (
                                                <span className="badge badge-ghost badge-xs bg-base-300 border-none">Soon</span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* User Profile Footer */}
            <div className="p-3 border-t border-base-300">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-base-300/50 cursor-pointer transition-all border border-transparent hover:border-base-300/80 group">
                    <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-9 h-9 shadow-sm group-hover:ring-2 ring-primary/30 transition-all">
                            <span className="text-xs font-bold">A</span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-base-content truncate">Admin User</p>
                        <p className="text-xs text-base-content/60 truncate capitalize">Administrator</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-base-200/50 bg-base-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Hamburger */}
            <button
                className="lg:hidden fixed top-3 left-3 z-50 btn btn-sm btn-ghost btn-square bg-base-100/80 backdrop-blur-sm border border-base-200 shadow-sm"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={clsx(
                    "lg:hidden fixed top-0 left-0 z-50 h-full w-72 transition-transform duration-300 shadow-2xl",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </aside>
        </>
    );
}
