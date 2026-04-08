/* Copyright 2026 Marimo. All rights reserved. */

import { useAtom } from "jotai";
import { CopyIcon, HomeIcon, XCircleIcon } from "lucide-react";
import { kernelStartupErrorAtom } from "@/core/errors/state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";

/**
 * Modal that displays kernel startup errors.
 * Shows when the kernel fails to start in sandbox mode,
 * displaying the stderr output so users can diagnose the issue.
 */
export const KernelStartupErrorModal: React.FC = () => {
  const [error, setError] = useAtom(kernelStartupErrorAtom);

  if (error === null) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(error);
      toast({
        title: "已复制到剪贴板",
        description: "错误详情已复制到剪贴板。",
      });
    } catch {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板。",
        variant: "danger",
      });
    }
  };

  const handleClose = () => {
    setError(null);
  };

  const handleReturnHome = () => {
    const withoutSearch = document.baseURI.split("?")[0];
    window.open(withoutSearch, "_self");
  };

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <XCircleIcon className="h-5 w-5" />
            内核启动失败
          </AlertDialogTitle>
          <AlertDialogDescription>
            内核启动失败。通常是因为包管理器无法安装 notebook 的依赖。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              错误详情
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={handleCopy}
              className="flex items-center gap-1"
            >
              <CopyIcon className="h-3 w-3" />
              复制
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto max-h-80">
            {error}
          </pre>
        </div>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleReturnHome}
            className="flex items-center gap-2"
          >
            <HomeIcon className="h-4 w-4" />
            返回首页
          </Button>
          <AlertDialogAction onClick={handleClose}>关闭</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
