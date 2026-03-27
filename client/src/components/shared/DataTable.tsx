"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount?: number;
    onPaginationChange?: (page: number) => void;
    currentPage?: number;
    isLoading?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    onPaginationChange,
    currentPage = 1,
    isLoading = false,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const isServerPaginated = pageCount !== undefined;

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: isServerPaginated ? undefined : getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
        manualPagination: isServerPaginated,
        pageCount: isServerPaginated ? pageCount : undefined,
    });

    return (
        <div className="w-full">
            <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow-sm">
                <table className="table table-zebra table-sm">
                    {/* Header */}
                    <thead className="bg-base-200/50 text-base-content uppercase text-xs">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <th
                                            key={header.id}
                                            className="py-3 px-4 font-semibold tracking-wider cursor-pointer hover:bg-base-200 transition-colors"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-2">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                {header.column.getCanSort() && (
                                                    <div className="flex flex-col text-base-content/30 w-3">
                                                        <ChevronUp
                                                            size={12}
                                                            className={`-mb-1 ${header.column.getIsSorted() === "asc"
                                                                    ? "text-primary"
                                                                    : ""
                                                                }`}
                                                        />
                                                        <ChevronDown
                                                            size={12}
                                                            className={
                                                                header.column.getIsSorted() === "desc"
                                                                    ? "text-primary"
                                                                    : ""
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>

                    {/* Body */}
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="h-24 text-center">
                                    <span className="loading loading-spinner loading-md text-primary"></span>
                                </td>
                            </tr>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-base-200/50 transition-colors border-b border-base-200 last:border-0"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="py-3 px-4 text-sm text-base-content/80">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="h-24 text-center text-base-content/50">
                                    No results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between py-4">
                <div className="text-sm text-base-content/60">
                    Showing <span className="font-medium text-base-content">{data.length}</span> rows
                </div>

                <div className="join border border-base-300 bg-base-100 shadow-sm">
                    <button
                        className="join-item btn btn-sm btn-ghost"
                        onClick={() => {
                            if (isServerPaginated && onPaginationChange) {
                                onPaginationChange(Math.max(1, currentPage - 1));
                            } else {
                                table.previousPage();
                            }
                        }}
                        disabled={
                            isServerPaginated
                                ? currentPage === 1
                                : !table.getCanPreviousPage()
                        }
                    >
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Prev</span>
                    </button>

                    <div className="join-item flex items-center px-4 text-sm font-medium border-x border-base-300">
                        {isServerPaginated ? currentPage : table.getState().pagination.pageIndex + 1}
                        <span className="mx-1 text-base-content/50">/</span>
                        {isServerPaginated ? pageCount : table.getPageCount()}
                    </div>

                    <button
                        className="join-item btn btn-sm btn-ghost"
                        onClick={() => {
                            if (isServerPaginated && onPaginationChange) {
                                onPaginationChange(currentPage + 1);
                            } else {
                                table.nextPage();
                            }
                        }}
                        disabled={
                            isServerPaginated
                                ? currentPage >= (pageCount || 1)
                                : !table.getCanNextPage()
                        }
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
