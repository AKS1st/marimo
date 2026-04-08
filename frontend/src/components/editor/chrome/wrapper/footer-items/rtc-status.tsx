/* Copyright 2026 Marimo. All rights reserved. */

import { useAtom, useAtomValue } from "jotai";
import { UsersIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { connectedDocAtom } from "@/core/codemirror/rtc/extension";
import { isRtcEnabled, usernameAtom } from "@/core/rtc/state";
import { FooterItem } from "../footer-item";

export const RTCStatus: React.FC = () => {
  const connectedDoc = useAtomValue(connectedDocAtom);
  const [username, setUsername] = useAtom(usernameAtom);
  const [open, setOpen] = useState(false);

  if (!isRtcEnabled()) {
    return null;
  }

  if (connectedDoc === "disabled") {
    return null;
  }

  const tooltip = connectedDoc
    ? "实时协作已启用"
    : "正在连接实时协作";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild={true}>
        <FooterItem
          tooltip={tooltip}
          selected={false}
          data-testid="footer-rtc-status"
        >
          <UsersIcon className="w-4 h-4" />
        </FooterItem>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">用户名</h4>
            <p className="text-sm text-muted-foreground">
              设置你在实时协作中的用户名
            </p>
          </div>
          <Input
            value={username}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="输入用户名"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
