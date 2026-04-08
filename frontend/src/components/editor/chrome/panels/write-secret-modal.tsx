/* Copyright 2026 Marimo. All rights reserved. */
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "@/components/ui/links";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useRequestClient } from "@/core/network/requests";
import type { ListSecretKeysResponse } from "@/core/network/types";

// dotenv providers should be at the top
export function sortProviders(providers: ListSecretKeysResponse["keys"]) {
  return providers.toSorted((a, b) => {
    if (a.provider === "env") {
      return 1;
    }
    if (b.provider === "env") {
      return -1;
    }
    return 0;
  });
}

/**
 * A modal component that allows users to add a new secret
 */
export const WriteSecretModal: React.FC<{
  providerNames: string[];
  onClose: () => void;
  onSuccess: (secretName: string) => void;
}> = ({ providerNames, onClose, onSuccess }) => {
  const { writeSecret } = useRequestClient();
  const [key, setKey] = React.useState("");
  const [value, setValue] = React.useState("");
  const [location, setLocation] = React.useState<string | undefined>(
    providerNames[0],
  );
  // Only dotenv is supported for now
  const provider = "dotenv";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      toast({
        title: "错误",
        description: "尚未为该密钥选择位置。",
        variant: "danger",
      });
      return;
    }

    if (!key || !value || !location) {
      toast({
        title: "错误",
        description: "请填写所有字段。",
        variant: "danger",
      });
      return;
    }

    try {
      await writeSecret({
        key,
        value,
        provider,
        name: location,
      });
      toast({
        title: "密钥已创建",
        description: "密钥已成功创建。",
      });
      onSuccess(key);
    } catch {
      toast({
        title: "错误",
        description: "创建密钥失败，请重试。",
        variant: "danger",
      });
    }
  };

  return (
    <DialogContent>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>添加密钥</DialogTitle>
          <DialogDescription>
            向环境变量中添加一个新密钥。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="key">键</Label>
            <Input
              id="key"
              value={key}
              onChange={(e) => {
                // Remove any non-word characters from the input
                setKey(replaceInvalid(e.target.value));
              }}
              placeholder="MY_SECRET_KEY"
              required={true}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="value">值</Label>
            <Input
              id="value"
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required={true}
              autoComplete="off"
            />
            {/* http is prone to man-in-the-middle */}
            {isHttpUrl() && (
                <FormDescription>
                  注意：你正在通过 http 发送这个密钥。
                </FormDescription>
              )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">位置</Label>
            {providerNames.length === 0 && (
              <p className="text-sm text-muted-foreground">
                尚未配置 dotenv 位置。
              </p>
            )}
            {providerNames.length > 0 && (
              <Select
                value={location}
                onValueChange={(value) => setLocation(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择提供方" />
                </SelectTrigger>
                <SelectContent>
                  {providerNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FormDescription>
              你可以通过配置{" "}
              <ExternalLink href="https://links.marimo.app/dotenv">
                dotenv 配置
              </ExternalLink>
              来设置位置。
            </FormDescription>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" disabled={!key || !value || !location}>
            添加密钥
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export function replaceInvalid(input: string): string {
  return input.replaceAll(/\W/g, "_");
}

function isHttpUrl(): boolean {
  const url = window.location.href;
  return url.startsWith("http://");
}
