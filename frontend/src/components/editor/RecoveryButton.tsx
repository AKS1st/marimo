/* Copyright 2026 Marimo. All rights reserved. */

import type { Notebook } from "@marimo-team/marimo-api";
import { SaveIcon } from "lucide-react";
import type { JSX } from "react";
import { Button as EditorButton } from "@/components/editor/inputs/Inputs";
import { Button } from "@/components/ui/button";
import { getNotebook } from "@/core/cells/cells";
import { notebookCells } from "@/core/cells/utils";
import { getMarimoVersion } from "@/core/meta/globals";
import { useEvent } from "@/hooks/useEvent";
import { downloadBlob } from "@/utils/download";
import { Paths } from "@/utils/paths";
import { useHotkey } from "../../hooks/useHotkey";
import { useImperativeModal } from "../modal/ImperativeModal";
import { renderShortcut } from "../shortcuts/renderShortcut";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "../ui/dialog";
import { Tooltip } from "../ui/tooltip";

const RecoveryModal = (props: {
  proposedName: string;
  closeModal: () => void;
}): JSX.Element => {
  const downloadRecoveryFile = () => {
    downloadBlob(
      new Blob([getNotebookJSON()], { type: "text/plain" }),
      `${props.proposedName}.json`,
    );
  };

  const getNotebookJSON = useEvent(() => {
    const notebook = getNotebook();
    const cells = notebookCells(notebook);
    const notbook: Notebook["NotebookV1"] = {
      version: "1",
      metadata: {
        marimo_version: getMarimoVersion(),
      },
      cells: cells.map((cell) => {
        return {
          id: cell.id,
          name: cell.name,
          code: cell.code,
          code_hash: null,
          config: {
            column: 0,
            ...cell.config,
          },
        };
      }),
    };
    return JSON.stringify(notbook, null, 2);
  });

  // NB: we use markdown class to have sane styling for list, paragraph
  return (
    <DialogContent className="w-fit">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          downloadRecoveryFile();
          props.closeModal();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            props.closeModal();
          }
        }}
      >
        <DialogTitle className="text-accent-foreground mb-6">
          下载未保存的更改？
        </DialogTitle>
        <DialogDescription
          className="markdown break-words"
          style={{ wordBreak: "break-word" }}
        >
          <div className="prose dark:prose-invert">
            <p>此应用有未保存的更改。恢复方法如下：</p>

            <ol>
              <li style={{ paddingBottom: "10px" }}>
                点击“下载”按钮。这会下载一个名为&nbsp;
                <code>{props.proposedName}.json</code>. This file contains your
                的文件，其中包含你的代码。
              </li>

              <li style={{ paddingBottom: "10px" }}>
                在终端中输入
                <code style={{ display: "block", padding: "10px" }}>
                  marimo recover {props.proposedName}.json {">"}{" "}
                  {props.proposedName}.py
                </code>
                ，即可用恢复的更改覆盖 <code>{props.proposedName}.py</code>。
              </li>
            </ol>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button
            aria-label="取消"
            variant="secondary"
            data-testid="cancel-recovery-button"
            onClick={props.closeModal}
          >
            取消
          </Button>
          <Button
            data-testid="download-recovery-button"
            aria-label="下载"
            variant="default"
            type="submit"
          >
            下载
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export const RecoveryButton = (props: {
  filename: string | null;
  needsSave: boolean;
}): JSX.Element => {
  const { filename, needsSave } = props;
  const { openModal, closeModal } = useImperativeModal();

  const proposedName =
    filename === null ? "app" : Paths.basename(filename).split(".")[0];

  const openRecoveryModal = () => {
    if (needsSave) {
      openModal(
        <RecoveryModal proposedName={proposedName} closeModal={closeModal} />,
      );
    }
  };

  useHotkey("global.save", openRecoveryModal);

  return (
    <Tooltip content={renderShortcut("global.save")}>
      <EditorButton
        onClick={openRecoveryModal}
        id="save-button"
        aria-label="Save"
        className="rectangle"
        color={needsSave ? "yellow" : "gray"}
      >
        <SaveIcon strokeWidth={1.5} size={18} />
      </EditorButton>
    </Tooltip>
  );
};
