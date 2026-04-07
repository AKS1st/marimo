/* Copyright 2026 Marimo. All rights reserved. */

import type { components } from "@marimo-team/marimo-api";
import { useState } from "react";
import { API } from "@/core/network/api";
import { useAsyncData } from "@/hooks/useAsyncData";
import { toast } from "../ui/use-toast";

export type MCPStatus = components["schemas"]["MCPStatusResponse"];
export type MCPRefreshResponse = components["schemas"]["MCPRefreshResponse"];

/**
 * Hook to fetch MCP server status
 */
export function useMCPStatus() {
  return useAsyncData<MCPStatus>(async () => {
    return API.get<MCPStatus>("/ai/mcp/status");
  }, []);
}

/**
 * Hook to refresh MCP server configuration
 */
export function useMCPRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await API.post<object, MCPRefreshResponse>("/ai/mcp/refresh", {});
      toast({
        title: "MCP 已刷新",
        description: "MCP 服务器配置已成功刷新",
      });
    } catch (error) {
      toast({
        title: "刷新失败",
        description:
          error instanceof Error ? error.message : "刷新 MCP 失败",
        variant: "danger",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return { refresh, isRefreshing };
}
