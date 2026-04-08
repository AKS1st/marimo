/* Copyright 2026 Marimo. All rights reserved. */

import {
  ActivityIcon,
  BotIcon,
  BoxIcon,
  DatabaseZapIcon,
  FileTextIcon,
  FolderTreeIcon,
  KeyRoundIcon,
  type LucideIcon,
  NetworkIcon,
  NotebookPenIcon,
  ScrollTextIcon,
  SquareDashedBottomCodeIcon,
  TerminalSquareIcon,
  TextSearchIcon,
  VariableIcon,
  XCircleIcon,
} from "lucide-react";
import { getFeatureFlag } from "@/core/config/feature-flag";
import type { Capabilities } from "@/core/kernel/messages";
import { isWasm } from "@/core/wasm/utils";

/**
 * Unified panel ID for all panels in sidebar and developer panel
 */
export type PanelType =
  // Sidebar defaults
  | "files"
  | "variables"
  | "outline"
  | "dependencies"
  | "packages"
  | "documentation"
  | "snippets"
  | "ai"
  // Developer panel defaults
  | "errors"
  | "scratchpad"
  | "tracing"
  | "secrets"
  | "logs"
  | "terminal"
  | "cache";

export type PanelSection = "sidebar" | "developer-panel";

export interface PanelDescriptor {
  type: PanelType;
  Icon: LucideIcon;
  /** Short label for developer panel tabs */
  label: string;
  /** Descriptive tooltip for sidebar icons */
  tooltip: string;
  /** If true, the panel is completely unavailable */
  hidden?: boolean;
  /** Which section this panel belongs to by default */
  defaultSection: PanelSection;
  /** Capability required for this panel to be visible. If the capability is false, the panel is hidden. */
  requiredCapability?: keyof Capabilities;
  /** Additional search keywords for the command palette */
  additionalKeywords?: string[];
}

/**
 * All panels in the application.
 * Panels can be in either sidebar or developer panel, configurable by user.
 */
export const PANELS: PanelDescriptor[] = [
  // Sidebar defaults
  {
    type: "files",
    Icon: FolderTreeIcon,
    label: "文件",
    tooltip: "查看文件",
    defaultSection: "sidebar",
    additionalKeywords: ["explorer", "browser", "directory"],
  },
  {
    type: "variables",
    Icon: VariableIcon,
    label: "变量",
    tooltip: "查看变量和数据源",
    defaultSection: "sidebar",
    additionalKeywords: ["state", "scope", "inspector"],
  },
  {
    type: "packages",
    Icon: BoxIcon,
    label: "包",
    tooltip: "管理包",
    defaultSection: "sidebar",
    additionalKeywords: ["dependencies", "pip", "install"],
  },
  {
    type: "ai",
    Icon: BotIcon,
    label: "AI",
    tooltip: "聊天与智能体",
    defaultSection: "sidebar",
    additionalKeywords: ["chat", "copilot", "assistant"],
  },
  {
    type: "outline",
    Icon: ScrollTextIcon,
    label: "大纲",
    tooltip: "查看大纲",
    defaultSection: "sidebar",
    additionalKeywords: ["toc", "structure", "headings"],
  },
  {
    type: "documentation",
    Icon: TextSearchIcon,
    label: "文档",
    tooltip: "查看实时文档",
    defaultSection: "sidebar",
    additionalKeywords: ["reference", "api"],
  },
  {
    type: "dependencies",
    Icon: NetworkIcon,
    label: "依赖",
    tooltip: "查看依赖关系",
    defaultSection: "sidebar",
    additionalKeywords: ["graph", "imports"],
  },
  // Developer panel defaults
  {
    type: "errors",
    Icon: XCircleIcon,
    label: "错误",
    tooltip: "查看错误",
    defaultSection: "developer-panel",
    additionalKeywords: ["exceptions", "problems", "diagnostics"],
  },
  {
    type: "scratchpad",
    Icon: NotebookPenIcon,
    label: "草稿板",
    tooltip: "草稿板",
    defaultSection: "developer-panel",
    additionalKeywords: ["scratch", "draft", "playground"],
  },
  {
    type: "tracing",
    Icon: ActivityIcon,
    label: "运行轨迹",
    tooltip: "查看运行轨迹",
    defaultSection: "developer-panel",
    additionalKeywords: ["profiling", "performance"],
  },
  {
    type: "secrets",
    Icon: KeyRoundIcon,
    label: "密钥",
    tooltip: "管理密钥",
    defaultSection: "developer-panel",
    hidden: isWasm(),
    additionalKeywords: ["env", "environment", "keys", "credentials"],
  },
  {
    type: "logs",
    Icon: FileTextIcon,
    label: "日志",
    tooltip: "查看日志",
    defaultSection: "developer-panel",
    additionalKeywords: ["console", "stdout"],
  },
  {
    type: "terminal",
    Icon: TerminalSquareIcon,
    label: "终端",
    tooltip: "终端",
    hidden: isWasm(),
    defaultSection: "developer-panel",
    requiredCapability: "terminal",
    additionalKeywords: ["shell", "console", "bash", "command"],
  },
  {
    type: "snippets",
    Icon: SquareDashedBottomCodeIcon,
    label: "示例片段",
    tooltip: "示例片段",
    defaultSection: "developer-panel",
    additionalKeywords: ["templates", "examples"],
  },
  {
    type: "cache",
    Icon: DatabaseZapIcon,
    label: "缓存",
    tooltip: "查看缓存",
    defaultSection: "developer-panel",
    hidden: !getFeatureFlag("cache_panel"),
    additionalKeywords: ["memory", "memoize"],
  },
];

export const PANEL_MAP = new Map<PanelType, PanelDescriptor>(
  PANELS.map((p) => [p.type, p]),
);

/**
 * Check if a panel should be hidden based on its `hidden` property
 * and `requiredCapability`.
 */
export function isPanelHidden(
  panel: PanelDescriptor,
  capabilities: Capabilities,
): boolean {
  if (panel.hidden) {
    return true;
  }
  if (panel.requiredCapability && !capabilities[panel.requiredCapability]) {
    return true;
  }
  return false;
}
