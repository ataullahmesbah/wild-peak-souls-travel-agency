"use client";

import { useState } from "react";
import { useAdminData } from "./use-admin-data";
import { adminDelete, adminBulkDelete, adminBulkUpdate, adminToggleField } from "@/app/actions/admin";

export function useAdminCRUD(model: string) {
  const data = useAdminData({ model, page: 1, limit: 20 });
  const [processing, setProcessing] = useState<string | null>(null);

  const deleteItem = async (id: string) => {
    setProcessing(id);
    const result = await adminDelete(model, id);
    if (result.success) data.refresh();
    setProcessing(null);
    return result;
  };

  const bulkDelete = async (ids: string[]) => {
    setProcessing("bulk-delete");
    const result = await adminBulkDelete(model, ids);
    if (result.success) data.refresh();
    setProcessing(null);
    return result;
  };

  const bulkStatus = async (ids: string[], status: string) => {
    setProcessing("bulk-status");
    const result = await adminBulkUpdate(model, ids, { status });
    if (result.success) data.refresh();
    setProcessing(null);
    return result;
  };

  const toggleField = async (id: string, field: string) => {
    setProcessing(id);
    const result = await adminToggleField(model, id, field);
    if (result.success) data.refresh();
    setProcessing(null);
    return result;
  };

  return {
    ...data,
    deleteItem,
    bulkDelete,
    bulkStatus,
    toggleField,
    processing,
  };
}
