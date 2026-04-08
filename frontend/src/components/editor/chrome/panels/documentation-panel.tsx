/* Copyright 2026 Marimo. All rights reserved. */

import { useAtomValue } from "jotai";
import React from "react";
import { documentationAtom } from "@/core/documentation/state";
import { renderHTML } from "@/plugins/core/RenderHTML";
import "../../documentation.css";
import { TextSearchIcon } from "lucide-react";
import { PanelEmptyState } from "./empty-state";

const DocumentationPanel: React.FC = () => {
  const { documentation } = useAtomValue(documentationAtom);

  if (!documentation) {
    return (
      <PanelEmptyState
        title="边写边看文档"
        description="将文本光标移到符号上即可查看其文档。"
        icon={<TextSearchIcon />}
      />
    );
  }

  return (
    <div className="p-3 overflow-y-auto overflow-x-hidden h-full docs-documentation flex flex-col gap-4">
      {renderHTML({ html: documentation })}
    </div>
  );
};

export default DocumentationPanel;
