/* Copyright 2026 Marimo. All rights reserved. */

import { CheckSquareIcon, Loader2, RefreshCwIcon } from "lucide-react";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField, FormItem } from "@/components/ui/form";
import type { UserConfig } from "@/core/config/config-schema";
import { useMCPRefresh, useMCPStatus } from "../mcp/hooks";
import { McpStatusText } from "../mcp/mcp-status-indicator";
import { Button } from "../ui/button";
import { Kbd } from "../ui/kbd";
import { SettingSubtitle } from "./common";
import { useOpenSettingsToTab } from "./state";

interface MCPConfigProps {
  form: UseFormReturn<UserConfig>;
  onSubmit: (values: UserConfig) => void;
}

type MCPPreset = "marimo" | "context7";

interface PresetConfig {
  id: MCPPreset;
  title: string;
  description: string;
}

const PRESET_CONFIGS: PresetConfig[] = [
  {
    id: "marimo",
    title: "marimo（文档）",
    description: "访问 marimo 文档",
  },
  {
    id: "context7",
    title: "Context7",
    description: "连接到 Context7 MCP 服务器",
  },
];

export const MCPConfig: React.FC<MCPConfigProps> = ({ form, onSubmit }) => {
  const { handleClick } = useOpenSettingsToTab();
  const { data: status, refetch, isFetching } = useMCPStatus();
  const { refresh, isRefreshing } = useMCPRefresh();

  const handleRefresh = async () => {
    await refresh();
    refetch();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SettingSubtitle>MCP 服务器</SettingSubtitle>
        <div className="flex items-center gap-2">
          {status && <McpStatusText status={status.status} />}
          <Button
            variant="outline"
            size="xs"
            onClick={handleRefresh}
            disabled={isRefreshing || isFetching}
          >
            {isRefreshing || isFetching ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCwIcon className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
      {status?.error && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2 rounded">
          {status.error}
        </div>
      )}
      {status?.servers && (
        <div className="text-xs text-muted-foreground">
          {Object.entries(status.servers).map(([server, status]) => (
            <div key={server}>
              {server}: <McpStatusText status={status} />
            </div>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        启用模型上下文协议（MCP）服务器，为 AI 功能提供额外能力和数据源。
      </p>
      <p className="text-sm text-muted-foreground">
        此功能需要 <Kbd className="inline">marimo[mcp]</Kbd> 包。查看{" "}
        <Button
          variant="link"
          onClick={() => handleClick("optionalDeps")}
          size="xs"
        >
          可选功能
        </Button>{" "}
        了解更多。
      </p>

      <FormField
        control={form.control}
        name="mcp.presets"
        render={({ field }) => {
          const presets = field.value || [];

          const togglePreset = (preset: MCPPreset) => {
            const newPresets = presets.includes(preset)
              ? presets.filter((p: string) => p !== preset)
              : [...presets, preset];
            field.onChange(newPresets);
            onSubmit(form.getValues());
          };

          return (
            <FormItem>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESET_CONFIGS.map((config) => {
                  const isChecked = presets.includes(config.id);

                  return (
                    <Card
                      key={config.id}
                      className={`cursor-pointer transition-all ${
                        isChecked
                          ? "border-[var(--blue-9)] bg-[var(--blue-2)]"
                          : "hover:border-[var(--blue-7)]"
                      }`}
                      onClick={() => togglePreset(config.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">
                            {config.title}
                          </CardTitle>
                          <span
                            className={`h-5 w-5 flex items-center justify-center rounded border ${
                              isChecked
                                ? "border-[var(--blue-7)] bg-[var(--blue-7)] text-foreground"
                                : "border-muted bg-background text-muted-foreground"
                            }`}
                          >
                            {isChecked ? <CheckSquareIcon /> : null}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{config.description}</CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </FormItem>
          );
        }}
      />
    </div>
  );
};
