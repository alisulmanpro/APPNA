"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronRight, Search, LogOut, User as UserIcon } from "lucide-react";

interface BreadcrumbSegment {
    label: string;
    href?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
    const crumbs: BreadcrumbSegment[] = [{ label: "APPNA", href: "/dashboard" }];

    if (pathname.startsWith("/meetings")) {
        crumbs.push({ label: "Meetings", href: "/meetings" });
        if (pathname === "/meetings/list") {
            crumbs.push({ label: "All Meetings" });
        } else if (pathname === "/meetings/schedule") {
            crumbs.push({ label: "Schedule Meeting" });
        } else if (pathname.match(/^\/meetings\/[^/]+$/)) {
            crumbs.push({ label: "Meeting Detail" });
        }
    } else if (pathname.startsWith("/members")) {
        crumbs.push({ label: "Members", href: "/members" });
        if (pathname.match(/^\/members\/[^/]+$/)) {
            crumbs.push({ label: "Member Profile" });
        }
    } else if (pathname.startsWith("/committees")) {
        crumbs.push({ label: "Committees", href: "/committees" });
        if (pathname.match(/^\/committees\/[^/]+$/)) {
            crumbs.push({ label: "Committee Details" });
        }
    } else if (pathname === "/dashboard") {
        crumbs.push({ label: "Overview" });
    }

    return crumbs;
}

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const crumbs = getBreadcrumbs(pathname);

    return (
        <header className="sticky top-0 z-20 bg-base-100/90 backdrop-blur-md border-b border-base-200/80 h-16 flex items-center px-4 lg:px-8 gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all">
            {/* Breadcrumbs — offset for mobile hamburger */}
            <nav className="flex-1 flex items-center gap-1.5 text-sm ml-12 lg:ml-0 overflow-hidden font-medium">
                {crumbs.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-1.5 min-w-0">
                        {i > 0 && (
                            <ChevronRight size={14} className="text-base-content/30 flex-shrink-0" />
                        )}
                        {crumb.href && i < crumbs.length - 1 ? (
                            <Link
                                href={crumb.href}
                                className="text-base-content/50 hover:text-primary transition-colors truncate"
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="text-base-content font-semibold truncate tracking-tight">{crumb.label}</span>
                        )}
                    </span>
                ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 sm:gap-3">
                {/* Search overlay button */}
                <button className="btn btn-ghost btn-sm btn-circle hidden md:flex text-base-content/60 hover:text-base-content hover:bg-base-200" aria-label="Search">
                    <Search size={18} />
                </button>

                {/* Notifications */}
                <button className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors">
                    <div className="indicator">
                        <Bell size={18} />
                        <span className="badge badge-error badge-xs rounded-full indicator-item border-base-100 border-[1.5px]"></span>
                    </div>
                </button>

                {/* Vertical Divider */}
                <div className="h-6 w-[1px] bg-base-300 mx-1 hidden sm:block"></div>

                {/* User Dropdown */}
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm rounded-full pl-1 pr-3 gap-2 flex items-center hover:bg-base-200 transition-colors">
                        <div className="avatar placeholder">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20">
                                <span className="text-xs font-bold">
                                    A
                                </span>
                            </div>
                        </div>
                        <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate leading-none">
                            Admin
                        </span>
                    </div>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-xl w-56 p-2 shadow-xl border border-base-200/80 mt-3 absolute animate-fade-in-up origin-top"
                    >
                        <li className="menu-title px-3 py-2 border-b border-base-200 mb-1">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-semibold text-base-content">Admin User</span>
                                <span className="text-xs text-base-content/60 font-medium capitalize">Administrator</span>
                            </div>
                        </li>
                        <li>
                            <Link href="#" className="flex items-center gap-2 py-2 text-base-content/80 hover:text-primary">
                                <UserIcon size={16} /> Profile Settings
                            </Link>
                        </li>
                        <li className="mt-1">
                            <button
                                className="flex items-center gap-2 py-2 text-error/80 hover:text-error hover:bg-error/10 font-medium transition-colors"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}
