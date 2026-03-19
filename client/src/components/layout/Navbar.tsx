"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Search } from "lucide-react";

interface BreadcrumbSegment {
    label: string;
    href?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
    const crumbs: BreadcrumbSegment[] = [{ label: "APPNA", href: "/meetings" }];
    if (pathname.startsWith("/meetings")) {
        crumbs.push({ label: "Meetings", href: "/meetings" });
        if (pathname === "/meetings/list") {
            crumbs.push({ label: "All Meetings" });
        } else if (pathname === "/meetings/schedule") {
            crumbs.push({ label: "Schedule Meeting" });
        } else if (pathname.match(/^\/meetings\/[^/]+$/)) {
            crumbs.push({ label: "Meeting Detail" });
        }
    }
    return crumbs;
}

export default function Navbar() {
    const pathname = usePathname();
    const crumbs = getBreadcrumbs(pathname);

    return (
        <header className="sticky top-0 z-30 bg-base-100 border-b border-base-300 h-14 flex items-center px-4 lg:px-6 gap-4">
            {/* Breadcrumbs — offset for mobile hamburger */}
            <nav className="flex-1 flex items-center gap-1 text-sm ml-10 lg:ml-0 overflow-hidden">
                {crumbs.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-1 min-w-0">
                        {i > 0 && (
                            <ChevronRight size={14} className="text-base-content/30 flex-shrink-0" />
                        )}
                        {crumb.href && i < crumbs.length - 1 ? (
                            <Link
                                href={crumb.href}
                                className="text-base-content/50 hover:text-base-content transition-colors truncate"
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="text-base-content font-medium truncate">{crumb.label}</span>
                        )}
                    </span>
                ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
                {/* Search button */}
                <button className="btn btn-ghost btn-sm btn-square hidden md:flex" aria-label="Search">
                    <Search size={16} />
                </button>

                {/* Notifications */}
                    <button className="btn btn-ghost btn-circle">
      <div className="indicator">
        <Bell size={16} />
        <span className="badge badge-xs rounded-full badge-primary indicator-item"></span>
      </div>
    </button>

                {/* User avatar */}
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="avatar placeholder cursor-pointer">
               <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS Navbar component"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
                    </div>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow-lg border border-base-300 mt-2"
                    >
                        <li className="menu-title text-xs px-3 py-1">Dr. Ahmed Khan · President</li>
                        <li><a>Profile</a></li>
                        <li><a>Settings</a></li>
                        <li><a className="text-error">Sign Out</a></li>
                    </ul>
                </div>
            </div>
        </header>
    );
}
