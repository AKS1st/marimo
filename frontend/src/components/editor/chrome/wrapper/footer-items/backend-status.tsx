/* Copyright 2026 Marimo. All rights reserved. */

import { atom, useAtomValue, useSetAtom } from "jotai";
import { AlertCircleIcon, CheckCircle2Icon, PowerOffIcon } from "lucide-react";
import type React from "react";
import { Spinner } from "@/components/icons/spinner";
import { Tooltip } from "@/components/ui/tooltip";
import { connectionAtom } from "@/core/network/connection";
import { useConnectToRuntime, useRuntimeManager } from "@/core/runtime/config";
import { store } from "@/core/state/jotai";
import { isWasm } from "@/core/wasm/utils";
import {
  isAppClosing,
  isAppConnected,
  isAppConnecting,
  isAppNotStarted,
} from "@/core/websocket/connection-utils";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useInterval } from "@/hooks/useInterval";

const CHECK_HEALTH_INTERVAL_MS = 30_000;

type ConnectionStatus = "healthy" | "unhealthy" | "connecting" | "disconnected";

export const connectionStatusAtom = atom<ConnectionStatus>("connecting");

export function getConnectionStatus(): ConnectionStatus {
  return store.get(connectionStatusAtom);
}

const CONNECTION_LABELS: Record<
  "NOT_STARTED" | "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED",
  string
> = {
  NOT_STARTED: "尚未启动",
  CONNECTING: "连接中",
  OPEN: "已连接",
  CLOSING: "正在断开",
  CLOSED: "已断开",
};

export const BackendConnectionStatus: React.FC = () => {
  const connection = useAtomValue(connectionAtom).state;
  const runtime = useRuntimeManager();
  const connectToRuntime = useConnectToRuntime();
  const setConnectionStatus = useSetAtom(connectionStatusAtom);

  const { isFetching, error, data, refetch } = useAsyncData(async () => {
    if (!isAppConnected(connection)) {
      setConnectionStatus("disconnected");
      return;
    }

    if (isWasm()) {
      setConnectionStatus("healthy");
      return {
        isHealthy: true,
        lastChecked: new Date(),
        error: undefined,
      };
    }

    try {
      const isHealthy = await runtime.isHealthy();
      setConnectionStatus(isHealthy ? "healthy" : "unhealthy");
      return {
        isHealthy,
        lastChecked: new Date(),
        error: undefined,
      };
    } catch (error) {
      setConnectionStatus("unhealthy");
      return {
        isHealthy: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : "未知错误",
      };
    }
  }, [runtime, connection]);

  useInterval(refetch, {
    delayMs: isAppConnected(connection) ? CHECK_HEALTH_INTERVAL_MS : null,
    whenVisible: true,
  });

  const getStatusInfo = () => {
    if (isAppNotStarted(connection)) {
      return "尚未连接到运行时";
    }

    const baseStatus = CONNECTION_LABELS[connection.state];
    const healthInfo = data?.lastChecked
      ? data.isHealthy
        ? "健康状态：正常"
        : "健康状态：异常"
      : "健康状态：未知";

    const errorInfo = error ? `错误：${error}` : "";

    return [baseStatus, healthInfo, errorInfo].filter(Boolean).join("\n");
  };

  const getStatusIcon = () => {
    if (isFetching || isAppConnecting(connection)) {
      return <Spinner size="small" />;
    }

    if (isAppClosing(connection)) {
      return <Spinner className="text-destructive" size="small" />;
    }

    if (isAppConnected(connection)) {
      if (data?.isHealthy) {
        return <CheckCircle2Icon className="w-4 h-4 text-(--green-9)" />;
      }
      if (data?.lastChecked) {
        return <AlertCircleIcon className="w-4 h-4 text-(--yellow-9)" />;
      }
      return <CheckCircle2Icon className="w-4 h-4" />;
    }

    if (isAppNotStarted(connection)) {
      return <PowerOffIcon className="w-4 h-4" />;
    }

    return <PowerOffIcon className="w-4 h-4 text-red-500" />;
  };

  const handleClick = () => {
    if (isAppNotStarted(connection)) {
      void connectToRuntime();
    } else {
      refetch();
    }
  };

  return (
    <Tooltip
      content={
        <div className="text-sm whitespace-pre-line">
          {getStatusInfo()}
          {isAppConnected(connection) && (
            <div className="mt-2 text-xs text-muted-foreground">
              点击刷新健康状态
            </div>
          )}
        </div>
      }
      data-testid="footer-backend-status"
    >
      <button
        type="button"
        onClick={handleClick}
        className="p-1 hover:bg-accent rounded flex items-center gap-1.5 text-xs text-muted-foreground"
        data-testid="backend-status"
      >
        {getStatusIcon()}
        <span>运行时</span>
      </button>
    </Tooltip>
  );
};
