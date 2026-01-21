"use client";

import { useState, useEffect } from "react";
import { AuditLog } from "@/types";
import { getHistory } from "@/lib/api";
import {
  X, History, Loader2, Plus, Pencil, Trash2,
  ChevronDown, ChevronUp, Clock, User
} from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: string;
  recordId: string | number;
  title?: string;
}

interface ParsedChange {
  field: string;
  oldValue: string;
  newValue: string;
}

export default function HistoryModal({
  isOpen,
  onClose,
  tableName,
  recordId,
  title = "Dəyişiklik Tarixçəsi"
}: HistoryModalProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, tableName, recordId]);

  const fetchHistory = async () => {
    setLoading(true);
    const data = await getHistory(tableName, recordId);
    setLogs(data);
    setLoading(false);
  };

  const toggleExpand = (logId: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Create':
        return <Plus size={14} className="text-emerald-400" />;
      case 'Update':
        return <Pencil size={14} className="text-blue-400" />;
      case 'Delete':
        return <Trash2 size={14} className="text-red-400" />;
      default:
        return <History size={14} className="text-slate-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Create':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Update':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Delete':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'Create':
        return 'Yaradıldı';
      case 'Update':
        return 'Yeniləndi';
      case 'Delete':
        return 'Silindi';
      default:
        return type;
    }
  };

  const parseChanges = (log: AuditLog): ParsedChange[] => {
    const changes: ParsedChange[] = [];

    try {
      const oldData = log.oldValues ? JSON.parse(log.oldValues) : {};
      const newData = log.newValues ? JSON.parse(log.newValues) : {};
      const affectedColumns = log.affectedColumns?.split(',').map(c => c.trim()) || [];

      if (log.type === 'Create') {
        Object.keys(newData).forEach(key => {
          if (newData[key] !== null && newData[key] !== undefined && newData[key] !== '') {
            changes.push({
              field: key,
              oldValue: '—',
              newValue: formatValue(newData[key])
            });
          }
        });
      } else if (log.type === 'Delete') {
        Object.keys(oldData).forEach(key => {
          if (oldData[key] !== null && oldData[key] !== undefined && oldData[key] !== '') {
            changes.push({
              field: key,
              oldValue: formatValue(oldData[key]),
              newValue: '—'
            });
          }
        });
      } else if (log.type === 'Update') {
        const columnsToCheck = affectedColumns.length > 0
          ? affectedColumns
          : [...new Set([...Object.keys(oldData), ...Object.keys(newData)])];

        columnsToCheck.forEach(key => {
          const oldVal = oldData[key];
          const newVal = newData[key];
          if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            changes.push({
              field: key,
              oldValue: formatValue(oldVal),
              newValue: formatValue(newVal)
            });
          }
        });
      }
    } catch (e) {
      console.error('Error parsing changes:', e);
    }

    return changes;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Bəli' : 'Xeyr';
    if (Array.isArray(value)) return value.join(', ') || '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFieldName = (field: string): string => {
    const fieldMap: Record<string, string> = {
      'Name': 'Ad',
      'Price': 'Qiymət',
      'OldPrice': 'Köhnə Qiymət',
      'Description': 'Təsvir',
      'ShortDescription': 'Qısa Təsvir',
      'IsNew': 'Yeni',
      'IsInStock': 'Stokda',
      'IsActive': 'Aktiv',
      'MainImageUrl': 'Əsas Şəkil',
      'CategoryIds': 'Kateqoriyalar',
      'BrandId': 'Brend',
      'Sku': 'SKU',
      'Title': 'Başlıq',
      'Link': 'Link',
      'ImageUrl': 'Şəkil',
      'ParentId': 'Ana Kateqoriya'
    };
    return fieldMap[field] || field;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <History size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="text-xs text-slate-400">{tableName} #{recordId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-3" />
              <p className="text-slate-400 text-sm">Tarixçə yüklənir...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <History size={48} className="text-slate-600 mb-3" />
              <p className="text-slate-400">Tarixçə tapılmadı</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const isExpanded = expandedLogs.has(log.id);
                const changes = parseChanges(log);

                return (
                  <div
                    key={log.id}
                    className="bg-slate-800/30 border border-slate-700/30 rounded-xl overflow-hidden"
                  >
                    {/* Log Header */}
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeBadge(log.type)}`}>
                          {getTypeIcon(log.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getTypeBadge(log.type)}`}>
                              {getTypeText(log.type)}
                            </span>
                            {changes.length > 0 && log.type === 'Update' && (
                              <span className="text-xs text-slate-500">
                                {changes.length} sahə
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDateTime(log.dateTime)}
                            </span>
                            {log.userId && (
                              <span className="flex items-center gap-1">
                                <User size={12} />
                                {log.userId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {changes.length > 0 && (
                        isExpanded ? (
                          <ChevronUp size={18} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={18} className="text-slate-400" />
                        )
                      )}
                    </button>

                    {/* Expanded Changes */}
                    {isExpanded && changes.length > 0 && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-slate-900/50 rounded-lg border border-slate-700/30 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-800/50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">Sahə</th>
                                {log.type !== 'Create' && (
                                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">Əvvəlki</th>
                                )}
                                {log.type !== 'Delete' && (
                                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">Yeni</th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                              {changes.slice(0, 10).map((change, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/30">
                                  <td className="px-3 py-2 text-slate-300 font-medium">
                                    {formatFieldName(change.field)}
                                  </td>
                                  {log.type !== 'Create' && (
                                    <td className="px-3 py-2 text-red-400/80 max-w-[200px] truncate">
                                      {change.oldValue}
                                    </td>
                                  )}
                                  {log.type !== 'Delete' && (
                                    <td className="px-3 py-2 text-emerald-400/80 max-w-[200px] truncate">
                                      {change.newValue}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {changes.length > 10 && (
                            <div className="px-3 py-2 text-xs text-slate-500 text-center bg-slate-800/30">
                              +{changes.length - 10} daha çox dəyişiklik
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
          <p className="text-xs text-slate-500 text-center">
            Toplam {logs.length} qeyd tapıldı
          </p>
        </div>
      </div>
    </div>
  );
}
