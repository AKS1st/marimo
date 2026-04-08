/* Copyright 2026 Marimo. All rights reserved. */

import { Slot as SlotPrimitive } from "radix-ui";

const Slot = SlotPrimitive.Slot;

import React, { type PropsWithChildren } from "react";
import { useImperativeModal } from "@/components/modal/ImperativeModal";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Constants } from "@/core/constants";

export const ContributeSnippetButton: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { openModal, closeModal } = useImperativeModal();

  return (
    <Slot
      onClick={() => openModal(<ContributeSnippetModal onClose={closeModal} />)}
    >
      {children}
    </Slot>
  );
};

const ContributeSnippetModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>贡献一个示例片段</DialogTitle>
        <DialogDescription>
          如果你有实用的片段想分享给社区，请提交一个拉取请求{" "}
          <a href={Constants.githubPage} target="_blank" className="underline">
            到 GitHub
          </a>
          .
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          data-testid="snippet-close-button"
          variant="default"
          onClick={onClose}
        >
          关闭
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
