"use client";

import { useState, useMemo, useEffect } from "react";
import { Category } from "@/types";
import { ChevronRight, ChevronDown, Check, Folder, Search, X } from "lucide-react";

interface CategorySelectorProps {
    categories: Category[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    mode: "single" | "multiple";
    excludeId?: number; // Edit modunda özünü seçməmək üçün
}

interface TreeNodeProps {
    category: Category;
    level: number;
    selectedIds: number[];
    onToggle: (id: number) => void;
    isExpanded: boolean;
    onExpand: (id: number) => void;
    mode: "single" | "multiple";
    hasChildren: boolean;
    searchTerm: string;
}

const TreeNode = ({
    category,
    level,
    selectedIds,
    onToggle,
    isExpanded,
    onExpand,
    mode,
    hasChildren,
    searchTerm
}: TreeNodeProps) => {
    const isSelected = selectedIds.includes(category.id);

    // Search logic: Highlight text if matches
    const renderName = () => {
        if (!searchTerm) return category.name;
        const parts = category.name.split(new RegExp(`(${searchTerm})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === searchTerm.toLowerCase()
                        ? <span key={i} className="bg-yellow-500/30 text-yellow-200">{part}</span>
                        : part
                )}
            </span>
        );
    };

    return (
        <div className="select-none">
            <div
                className={`
          flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors
          ${isSelected
                        ? "bg-blue-500/20 text-blue-300"
                        : "hover:bg-slate-800/50 text-slate-300"}
        `}
                style={{ paddingLeft: `${(level * 20) + 12}px` }}
                onClick={() => onToggle(category.id)}
            >
                {/* Expand/Collapse Button */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onExpand(category.id);
                    }}
                    className={`
            w-5 h-5 flex items-center justify-center rounded hover:bg-slate-700/50 transition-colors
            ${!hasChildren ? "opacity-0 cursor-default" : "cursor-pointer"}
          `}
                >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>

                {/* Checkbox / Radio */}
                <div className={`
          w-5 h-5 rounded border flex items-center justify-center transition-all
          ${isSelected
                        ? (mode === 'multiple' ? "bg-blue-500 border-blue-500" : "bg-blue-500 border-blue-500 rounded-full")
                        : "border-slate-600 bg-slate-800"}
        `}>
                    {isSelected && <Check size={12} className="text-white" />}
                </div>

                {/* Name */}
                <span className="text-sm font-medium flex-1 truncate">
                    {renderName()}
                </span>
            </div>
        </div>
    );
};

export default function CategorySelector({
    categories,
    selectedIds,
    onChange,
    mode,
    excludeId
}: CategorySelectorProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    // Recursive filtration to support search
    // If a child matches filter, keep parent even if parent doesn't match
    const filterTree = (nodes: Category[], term: string): Category[] => {
        return nodes.map(node => {
            // If filtering recursive children
            const filteredChildren = node.children ? filterTree(node.children, term) : [];

            const matches = node.name.toLowerCase().includes(term.toLowerCase());
            const hasMatchingChildren = filteredChildren.length > 0;

            if (matches || hasMatchingChildren) {
                return { ...node, children: filteredChildren };
            }
            return null;
        }).filter(Boolean) as Category[];
    };

    const displayCategories = useMemo(() => {
        // 1. Filter out excluded ID (for edit category page)
        const validCategories = excludeId
            ? categories.filter(c => c.id !== excludeId) // This only filters top level, need deep filter if needed
            : categories;

        if (!searchTerm) return validCategories;

        // 2. Search filter
        return filterTree(validCategories, searchTerm);
    }, [categories, searchTerm, excludeId]);

    // Auto-expand on search
    useEffect(() => {
        if (searchTerm) {
            const getAllIds = (nodes: Category[]): number[] => {
                let ids: number[] = [];
                for (const node of nodes) {
                    ids.push(node.id);
                    if (node.children) ids = ids.concat(getAllIds(node.children));
                }
                return ids;
            };
            setExpandedIds(getAllIds(displayCategories));
        }
    }, [searchTerm, displayCategories]);

    const handleToggle = (id: number) => {
        if (mode === "single") {
            // If clicking already selected, deselect (optional)
            // For now, simple toggle:
            onChange(selectedIds.includes(id) ? [] : [id]);
        } else {
            // Multiple
            if (selectedIds.includes(id)) {
                onChange(selectedIds.filter(i => i !== id));
            } else {
                onChange([...selectedIds, id]);
            }
        }
    };

    const handleExpand = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Render recursive tree
    const renderTree = (nodes: Category[], level = 0) => {
        return nodes.map(node => {
            // Deep exclude check (if node matches excludeId)
            if (excludeId === node.id) return null;

            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expandedIds.includes(node.id);

            return (
                <div key={node.id}>
                    <TreeNode
                        category={node}
                        level={level}
                        selectedIds={selectedIds}
                        onToggle={handleToggle}
                        isExpanded={isExpanded}
                        onExpand={handleExpand}
                        mode={mode}
                        hasChildren={!!hasChildren}
                        searchTerm={searchTerm}
                    />
                    {hasChildren && isExpanded && (
                        <div className="border-l border-slate-700 ml-[22px]">
                            {renderTree(node.children!, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/30">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Kateqoriya axtar..."
                        className="w-full pl-9 pr-9 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Tree List */}
            <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {displayCategories.length > 0 ? renderTree(displayCategories) : (
                    <p className="text-center text-slate-500 py-4 text-sm">Nəticə tapılmadı</p>
                )}
            </div>

            {/* Footer Info */}
            <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
                <span>{mode === 'single' ? 'Tək seçim' : 'Çoxlu seçim'}</span>
                <span>{selectedIds.length} seçilib</span>
            </div>
        </div>
    );
}
