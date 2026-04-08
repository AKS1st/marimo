/* Copyright 2026 Marimo. All rights reserved. */

import { useAtomValue } from "jotai";
import { SparklesIcon } from "lucide-react";
import React from "react";
import { useOpenSettingsToTab } from "@/components/app-config/state";
import { aiAtom, aiEnabledAtom } from "@/core/config/config";
import { DEFAULT_AI_MODEL } from "@/core/config/config-schema";
import { FooterItem } from "../footer-item";

export const AIStatusIcon: React.FC = () => {
  const ai = useAtomValue(aiAtom);
  const aiEnabled = useAtomValue(aiEnabledAtom);
  const chatModel = ai?.models?.chat_model || DEFAULT_AI_MODEL;
  const editModel = ai?.models?.edit_model || chatModel;
  const { handleClick } = useOpenSettingsToTab();

  if (!aiEnabled) {
    return (
      <FooterItem
        tooltip="辅助功能已禁用"
        selected={false}
        onClick={() => handleClick("ai")}
        data-testid="footer-ai-disabled"
      >
        <SparklesIcon className="h-4 w-4 opacity-60" />
      </FooterItem>
    );
  }

  return (
    <FooterItem
      tooltip={
        <>
          <b>聊天模型：</b> {chatModel}
          <br />
          <b>编辑模型：</b> {editModel}
        </>
      }
      onClick={() => handleClick("ai")}
      selected={false}
      data-testid="footer-ai-enabled"
    >
      <SparklesIcon className="h-4 w-4" />
    </FooterItem>
  );
};
