/* Copyright 2026 Marimo. All rights reserved. */

import { useAtomValue } from "jotai";
import { DatabaseZapIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import React, { useState } from "react";
import { useLocale } from "react-aria";
import { Spinner } from "@/components/icons/spinner";
import { Button } from "@/components/ui/button";
import { ConfirmationButton } from "@/components/ui/confirmation-button";
import { toast } from "@/components/ui/use-toast";
import { cacheInfoAtom } from "@/core/cache/requests";
import { useRequestClient } from "@/core/network/requests";
import { useAsyncData } from "@/hooks/useAsyncData";
import { cn } from "@/utils/cn";
import { formatBytes, formatTime } from "@/utils/formatting";
import { prettyNumber } from "@/utils/numbers";
import { PanelEmptyState } from "./empty-state";

const CachePanel = () => {
  const { clearCache, getCacheInfo } = useRequestClient();
  const cacheInfo = useAtomValue(cacheInfoAtom);
  const [purging, setPurging] = useState(false);
  const { locale } = useLocale();

  const { isPending, isFetching, refetch } = useAsyncData(async () => {
    await getCacheInfo();
    // Artificially spin the icon if the request is really fast
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, []);

  const handlePurge = async () => {
    try {
      setPurging(true);
      await clearCache();
      toast({
        title: "缓存已清空",
        description: "所有缓存数据都已清除。",
      });
      // Request updated cache info after purge
      refetch();
    } catch (error) {
      toast({
        title: "错误",
        description:
          error instanceof Error ? error.message : "清空缓存失败",
        variant: "danger",
      });
    } finally {
      setPurging(false);
    }
  };

  // Show spinner only on initial load
  if (isPending && !cacheInfo) {
    return <Spinner size="medium" centered={true} />;
  }

  const refreshButton = (
    <Button variant="outline" size="sm" onClick={refetch} disabled={isFetching}>
      {isFetching ? (
        <Spinner size="small" className="w-4 h-4 mr-2" />
      ) : (
        <RefreshCwIcon className="w-4 h-4 mr-2" />
      )}
      刷新
    </Button>
  );

  if (!cacheInfo) {
    return (
      <PanelEmptyState
        title="暂无缓存数据"
        description="无法获取缓存信息。"
        icon={<DatabaseZapIcon />}
        action={refreshButton}
      />
    );
  }

  const totalHits = cacheInfo.hits;
  const totalMisses = cacheInfo.misses;
  const totalTime = cacheInfo.time;
  const diskTotal = cacheInfo.disk_total;
  const diskToFree = cacheInfo.disk_to_free;

  const totalRequests = totalHits + totalMisses;
  const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

  // Show empty state if no cache activity
  if (totalRequests === 0) {
    return (
      <PanelEmptyState
        title="暂无缓存活动"
        description="缓存尚未被使用。相关函数执行后会显示在这里。"
        icon={<DatabaseZapIcon />}
        action={refreshButton}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex flex-col gap-4 p-4 h-full">
        {/* Header with Refresh Button */}
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={refetch}
            disabled={isFetching}
          >
            <RefreshCwIcon
              className={cn(
                "h-4 w-4 text-muted-foreground hover:text-foreground",
                isFetching && "animate-[spin_0.5s]",
              )}
            />
          </Button>
        </div>

        {/* Statistics Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">统计</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="节省时间"
              value={formatTime(totalTime, locale)}
              description="累计节省的执行时间"
            />
            <StatCard
              label="Hit rate"
              value={
                totalRequests > 0 ? `${prettyNumber(hitRate, locale)}%` : "—"
              }
              description={`${prettyNumber(totalHits, locale)} hits / ${prettyNumber(totalRequests, locale)} total`}
            />
            <StatCard
              label="缓存命中"
              value={prettyNumber(totalHits, locale)}
              description="成功从缓存中获取的次数"
            />
            <StatCard
              label="缓存未命中"
              value={prettyNumber(totalMisses, locale)}
              description="未找到缓存"
            />
          </div>
        </div>

        {/* Storage Section */}
        {diskTotal > 0 && (
          <div className="space-y-3 pt-2 border-t">
            <h3 className="text-sm font-semibold text-foreground">存储</h3>
            <div className="grid grid-cols-1 gap-3">
              <StatCard
                label="磁盘占用"
                value={formatBytes(diskTotal, locale)}
                description={
                  diskToFree > 0
                    ? `可释放 ${formatBytes(diskToFree, locale)}`
                    : "磁盘上的缓存存储"
                }
              />
            </div>
          </div>
        )}

        <div className="my-auto" />

        {/* Actions Section */}
        <div className="pt-2 border-t">
          <ConfirmationButton
            title="清空缓存？"
            description="这会永久删除所有缓存数据。此操作无法撤销。"
            confirmText="清空"
            destructive={true}
            onConfirm={handlePurge}
          >
            <Button
              variant="outlineDestructive"
              size="xs"
              disabled={purging}
              className="w-full"
            >
              {purging ? (
                <Spinner size="small" className="w-3 h-3 mr-2" />
              ) : (
                <Trash2Icon className="w-3 h-3 mr-2" />
              )}
              Purge Cache
            </Button>
          </ConfirmationButton>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  description?: string;
}> = ({ label, value, description }) => {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg border bg-card">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
      {description && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
    </div>
  );
};

export default CachePanel;
