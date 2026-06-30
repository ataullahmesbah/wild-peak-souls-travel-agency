"use client";

import { useState, useEffect, useCallback } from "react";
import { adminList } from "@/app/actions/admin";

export interface AdminDataOptions {
  model: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function useAdminData<T>(options: AdminDataOptions) {
  const { model, page: initialPage = 1, limit: initialLimit = 20 } = options;
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await adminList(model, page, limit, search || undefined, status || undefined);
    if (result.success === true && result.data) {
      const d = result.data as any;
      setData(d.items || []);
      setTotal(d.total || 0);
    } else if (result.success === false) {
      setError(result.error || "Failed to load data");
    }
    setLoading(false);
  }, [model, page, limit, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = () => {
    setPage(1);
    load();
  };

  return {
    data,
    total,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    status,
    setStatus,
    loading,
    error,
    refresh,
    load,
  };
}
