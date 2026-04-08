/* Copyright 2026 Marimo. All rights reserved. */

import {
  ChevronDownIcon,
  ExternalLinkIcon,
  InfoIcon,
  PowerOffIcon,
  ZapIcon,
  ZapOffIcon,
} from "lucide-react";
import type React from "react";
import { DisableIfOverridden } from "@/components/app-config/is-overridden";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink } from "@/components/ui/links";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { useResolvedMarimoConfig } from "@/core/config/config";
import { useRequestClient } from "@/core/network/requests";
import { isWasm } from "@/core/wasm/utils";
import { cn } from "@/utils/cn";
import { FooterItem } from "../footer-item";

interface RuntimeSettingsProps {
  className?: string;
}

export const RuntimeSettings: React.FC<RuntimeSettingsProps> = ({
  className,
}) => {
  const { saveUserConfig } = useRequestClient();
  const [config, setUserConfig] = useResolvedMarimoConfig();

  const handleStartupToggle = async (checked: boolean) => {
    await saveUserConfig({
      config: { runtime: { auto_instantiate: checked } },
    }).then(() => {
      setUserConfig((prev) => ({
        ...prev,
        runtime: { ...prev.runtime, auto_instantiate: checked },
      }));
    });
  };

  const handleCellChangeToggle = async (checked: boolean) => {
    const onCellChange = checked ? "autorun" : "lazy";
    await saveUserConfig({
      config: { runtime: { on_cell_change: onCellChange } },
    }).then(() => {
      setUserConfig((prev) => ({
        ...prev,
        runtime: { ...prev.runtime, on_cell_change: onCellChange },
      }));
    });
  };

  const handleModuleReloadChange = async (
    option: "off" | "lazy" | "autorun",
  ) => {
    await saveUserConfig({
      config: { runtime: { auto_reload: option } },
    }).then(() => {
      setUserConfig((prev) => ({
        ...prev,
        runtime: { ...prev.runtime, auto_reload: option },
      }));
    });
  };

  const allReactivityDisabled =
    !config.runtime.auto_instantiate &&
    config.runtime.on_cell_change === "lazy" &&
    (isWasm() || config.runtime.auto_reload !== "autorun");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <FooterItem
          tooltip="运行时响应"
          selected={false}
          data-testid="footer-runtime-settings"
        >
          <div className="flex items-center gap-1">
            {allReactivityDisabled ? (
              <ZapOffIcon size={16} className="text-muted-foreground" />
            ) : (
              <ZapIcon size={16} className="text-amber-500" />
            )}
            <ChevronDownIcon size={14} />
          </div>
        </FooterItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between w-full">
            <span>运行时响应</span>
            <ExternalLink href="https://links.marimo.app/runtime-configuration">
              <span className="text-xs font-normal flex items-center gap-1">
                文档
                <ExternalLinkIcon className="w-3 h-3" />
              </span>
            </ExternalLink>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <TooltipProvider>
          <DisableIfOverridden name="runtime.auto_instantiate">
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center space-x-2">
                {config.runtime.auto_instantiate ? (
                  <ZapIcon size={14} className="text-amber-500" />
                ) : (
                  <ZapOffIcon size={14} className="text-muted-foreground" />
                )}
                <div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    启动时
                    <Tooltip
                      content={
                        <div className="max-w-[200px]">
                          是否在启动时自动运行 notebook
                        </div>
                      }
                    >
                      <InfoIcon className="w-3 h-3" />
                    </Tooltip>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {config.runtime.auto_instantiate ? "autorun" : "lazy"}
                  </div>
                </div>
              </div>
              <Switch
                checked={config.runtime.auto_instantiate}
                onCheckedChange={handleStartupToggle}
                size="sm"
              />
            </div>
          </DisableIfOverridden>

          <DropdownMenuSeparator />

          <DisableIfOverridden name="runtime.on_cell_change">
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center space-x-2">
                {config.runtime.on_cell_change === "autorun" ? (
                  <ZapIcon size={14} className="text-amber-500" />
                ) : (
                  <ZapOffIcon size={14} className="text-muted-foreground" />
                )}
                <div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    单元格变更时
                    <Tooltip
                      content={
                        <div className="max-w-[300px]">
                          是否在运行单元格后自动运行依赖单元格
                        </div>
                      }
                    >
                      <InfoIcon className="w-3 h-3" />
                    </Tooltip>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {config.runtime.on_cell_change}
                  </div>
                </div>
              </div>
              <Switch
                checked={config.runtime.on_cell_change === "autorun"}
                onCheckedChange={handleCellChangeToggle}
                size="sm"
              />
            </div>
          </DisableIfOverridden>

          {!isWasm() && (
            <>
              <DropdownMenuSeparator />

              <DisableIfOverridden name="runtime.auto_reload">
                <div className="px-2 py-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {config.runtime.auto_reload === "off" && (
                      <PowerOffIcon
                        size={14}
                        className="text-muted-foreground"
                      />
                    )}
                    {config.runtime.auto_reload === "lazy" && (
                      <ZapOffIcon size={14} className="text-muted-foreground" />
                    )}
                    {config.runtime.auto_reload === "autorun" && (
                      <ZapIcon size={14} className="text-amber-500" />
                    )}
                    <div>
                      <div className="text-sm font-medium flex items-center gap-1">
                        模块变更时
                        <Tooltip
                          content={
                            <div className="max-w-[300px]">
                              外部模块更新时，是否运行受影响的单元格、将其标记为过期，或者什么都不做
                            </div>
                          }
                        >
                          <InfoIcon className="w-3 h-3" />
                        </Tooltip>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {config.runtime.auto_reload}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {["off", "lazy", "autorun"].map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          handleModuleReloadChange(
                            option as "off" | "lazy" | "autorun",
                          )
                        }
                        className={cn(
                          "w-full flex items-center px-2 py-1 text-sm rounded hover:bg-accent",
                          option === config.runtime.auto_reload && "bg-accent",
                        )}
                      >
                        {option === "off" && (
                          <PowerOffIcon size={12} className="mr-2" />
                        )}
                        {option === "lazy" && (
                          <ZapOffIcon size={12} className="mr-2" />
                        )}
                        {option === "autorun" && (
                          <ZapIcon size={12} className="mr-2" />
                        )}
                        <span className="capitalize">{option}</span>
                        {option === config.runtime.auto_reload && (
                          <span className="ml-auto">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </DisableIfOverridden>
            </>
          )}
        </TooltipProvider>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
