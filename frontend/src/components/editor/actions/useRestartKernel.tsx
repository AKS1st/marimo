/* Copyright 2026 Marimo. All rights reserved. */

import { useSetAtom } from "jotai";
import { useImperativeModal } from "@/components/modal/ImperativeModal";
import { AlertDialogDestructiveAction } from "@/components/ui/alert-dialog";
import { connectionAtom } from "@/core/network/connection";
import { useRequestClient } from "@/core/network/requests";
import { WebSocketState } from "@/core/websocket/types";
import { reloadSafe } from "@/utils/reload-safe";

export function useRestartKernel() {
  const { openConfirm } = useImperativeModal();
  const setConnection = useSetAtom(connectionAtom);
  const { sendRestart } = useRequestClient();

  return () => {
    openConfirm({
       title: "重启内核",
      description:
        "这会重启 Python 内核。你会丢失所有内存中的数据，也会丢失未保存的更改，所以请在重启前先保存你的工作。",
      variant: "destructive",
      confirmAction: (
        <AlertDialogDestructiveAction
          onClick={async () => {
            setConnection({ state: WebSocketState.CLOSING });
            await sendRestart();
            reloadSafe();
          }}
           aria-label="确认重启"
        >
          重启
        </AlertDialogDestructiveAction>
      ),
    });
  };
}
