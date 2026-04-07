/* Copyright 2026 Marimo. All rights reserved. */

import { BoxIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import React from "react";
import { Spinner } from "@/components/icons/spinner";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useResolvedMarimoConfig } from "@/core/config/config";
import { useRequestClient } from "@/core/network/requests";
import { isWasm } from "@/core/wasm/utils";
import { useAsyncData } from "@/hooks/useAsyncData";
import { ErrorBanner } from "@/plugins/impl/common/error-banner";
import { cn } from "@/utils/cn";
import { SettingSubtitle } from "./common";

interface Package {
  name: string;
  minVersion?: string;
}

interface OptionalFeature {
  id: string;
  /**
   * Required packages to install for the feature to work.
   */
  packagesRequired: Package[];
  /**
   * Additional packages to install if installed through this UI.
   */
  additionalPackageInstalls: Package[];
  /**
   * Description of the feature.
   */
  description: string;
}

// Define the optional dependencies and their features
const OPTIONAL_DEPENDENCIES: OptionalFeature[] = [
  {
    id: "sql",
    packagesRequired: [{ name: "duckdb" }, { name: "sqlglot" }],
    additionalPackageInstalls: [{ name: "polars[pyarrow]" }],
    description: "SQL 单元格",
  },
  {
    id: "charts",
    packagesRequired: [{ name: "altair" }],
    additionalPackageInstalls: [],
    description: "数据源查看器中的图表",
  },
  {
    id: "fast-charts",
    packagesRequired: [{ name: "vegafusion" }, { name: "vl-convert-python" }],
    additionalPackageInstalls: [],
    description: "快速的服务端图表",
  },
  {
    id: "formatting",
    packagesRequired: [isWasm() ? { name: "black" } : { name: "ruff" }],
    additionalPackageInstalls: [],
    description: "代码格式化",
  },
  {
    id: "ai",
    packagesRequired: [{ name: "openai" }],
    additionalPackageInstalls: [],
    description: "AI 功能",
  },
  {
    id: "mcp",
    packagesRequired: [{ name: "mcp", minVersion: "1" }],
    additionalPackageInstalls: [{ name: "pydantic", minVersion: "2" }],
    description: "连接 MCP 服务器",
  },
  {
    id: "ipy-export",
    packagesRequired: [{ name: "nbformat" }],
    additionalPackageInstalls: [],
    description: "导出为 IPYNB",
  },
  {
    id: "testing",
    packagesRequired: [{ name: "pytest" }],
    additionalPackageInstalls: [],
    description: "自动运行单元测试",
  },
];

// Only available outside wasm
if (!isWasm()) {
  OPTIONAL_DEPENDENCIES.push({
    id: "lsp",
    packagesRequired: [{ name: "python-lsp-server" }, { name: "websockets" }],
    additionalPackageInstalls: [{ name: "python-lsp-ruff" }],
    description: "语言服务器协议*",
  });
}

export const OptionalFeatures: React.FC = () => {
  const [config] = useResolvedMarimoConfig();
  const packageManager = config.package_management.manager;
  const { getPackageList } = useRequestClient();
  const { data, error, refetch, isPending } = useAsyncData(
    () => getPackageList(),
    [packageManager],
  );

  if (isPending) {
    return <Spinner size="medium" centered={true} />;
  }

  if (error) {
    return <ErrorBanner error={error} />;
  }

  const installedPackages = data?.packages || [];
  const installedPackageNames = new Set(
    installedPackages.map((pkg) => pkg.name),
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-2">
      <SettingSubtitle>可选功能</SettingSubtitle>
      <p className="text-sm text-muted-foreground">
        marimo 很轻量，依赖较少，以便尽可能兼容你的环境。
        <br />
        如需解锁 marimo 编辑器的更多功能，可以安装以下可选依赖：
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>依赖</TableHead>
            <TableHead>功能</TableHead>
            <TableHead>状态</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {OPTIONAL_DEPENDENCIES.map((dep) => {
            const isInstalled = dep.packagesRequired.every((pkg) =>
              installedPackageNames.has(pkg.name.split("[")[0]),
            );
            const packageSpec = dep.packagesRequired
              .map((pkg) => pkg.name)
              .join(", ");

            return (
              <TableRow key={dep.id} className="text-sm">
                <TableCell>{dep.description}</TableCell>
                <TableCell className="font-mono text-xs">
                  {packageSpec}
                </TableCell>
                <TableCell>
                  {isInstalled ? (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-(--grass-10) mr-2" />
                      <span>已安装</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <XCircleIcon className="h-4 w-4 text-(--red-10) mr-2" />
                      <InstallButton
                        packageSpecs={[
                          ...dep.packagesRequired,
                          ...dep.additionalPackageInstalls,
                        ]}
                        packageManager={packageManager}
                        onSuccess={refetch}
                      />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <p className="text-muted-foreground mt-2">*需要重启服务器</p>
    </div>
  );
};

const InstallButton: React.FC<{
  packageSpecs: Package[];
  packageManager: string;
  onSuccess: () => void;
}> = ({ packageSpecs, packageManager, onSuccess }) => {
  const [loading, setLoading] = React.useState(false);
  const { addPackage } = useRequestClient();

  const handleInstall = async () => {
    try {
      setLoading(true);
      const packageSpec = packageSpecs
        .map((pkg) => {
          if (pkg.minVersion) {
            return `${pkg.name}>=${pkg.minVersion}`;
          }
          return pkg.name;
        })
        .join(" ");
      const response = await addPackage({ package: packageSpec, group: "dev" });
      if (response.success) {
        onSuccess();
        toast({
          title: "包已安装",
          description: (
            <span>
              包{" "}
              <Kbd className="inline">
                {packageSpecs.map((pkg) => pkg.name).join(", ")}
              </Kbd>{" "}
              已添加到你的环境中。
            </span>
          ),
        });
      } else {
        toast({
          title: "安装包失败",
          description: response.error,
          variant: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="xs"
      variant="outline"
      className={cn("text-xs", loading && "opacity-50 cursor-not-allowed")}
      onClick={handleInstall}
      disabled={loading}
    >
      {loading ? (
        <Spinner size="small" className="mr-2 h-3 w-3" />
      ) : (
        <BoxIcon className="mr-2 h-3 w-3" />
      )}
      使用 {packageManager} 安装
    </Button>
  );
};
