/* Copyright 2026 Marimo. All rights reserved. */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLink } from "@/components/ui/links";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddDatabaseForm } from "./database/add-database-form";
import { AddStorageForm } from "./storage/add-storage-form";

type ConnectionTab = "databases" | "storage";

export const AddConnectionDialog: React.FC<{
  children: React.ReactNode;
  defaultTab?: ConnectionTab;
}> = ({ children, defaultTab = "databases" }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={true}>{children}</DialogTrigger>
      <AddConnectionDialogContent
        defaultTab={defaultTab}
        onClose={() => setOpen(false)}
      />
    </Dialog>
  );
};

export const AddConnectionDialogContent: React.FC<{
  defaultTab?: ConnectionTab;
  onClose: () => void;
}> = ({ defaultTab = "databases", onClose }) => {
  const [activeTab, setActiveTab] = useState<ConnectionTab>(defaultTab);

  const tabHeader = (
    <TabsList className="w-full mb-4">
      <TabsTrigger value="databases" className="flex-1">
        数据库与目录
      </TabsTrigger>
      <TabsTrigger value="storage" className="flex-1">
        远程存储
      </TabsTrigger>
    </TabsList>
  );

  const codeSnippetHint =
    activeTab === "databases" ? (
      <>
        没有找到你的数据库或连接方式？只需要一个{" "}
        <ExternalLink href="https://docs.marimo.io/guides/working_with_data/sql/#connecting-to-a-custom-database">
          代码片段
        </ExternalLink>{" "}
        就够了。
      </>
    ) : (
      <>
        没有找到你的存储或连接方式？只需要一个{" "}
        <ExternalLink href="https://docs.marimo.io/guides/working_with_data/remote_storage/#creating-a-storage-connection">
          代码片段
        </ExternalLink>{" "}
        就够了。
      </>
    );

  return (
    <DialogContent className="max-h-[75vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>添加连接</DialogTitle>
        <DialogDescription>
          直接从笔记本连接到{" "}
          <ExternalLink href="https://docs.marimo.io/guides/working_with_data/sql/#connecting-to-a-custom-database">
            数据库、数据目录
          </ExternalLink>{" "}
          或{" "}
          <ExternalLink href="https://docs.marimo.io/guides/working_with_data/remote_storage/">
            远程存储
          </ExternalLink>
          。
          <span className="block">{codeSnippetHint}</span>
        </DialogDescription>
      </DialogHeader>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ConnectionTab)}
      >
        <TabsContent
          value="databases"
          className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <AddDatabaseForm onSubmit={onClose} header={tabHeader} />
        </TabsContent>
        <TabsContent
          value="storage"
          className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <AddStorageForm onSubmit={onClose} header={tabHeader} />
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
};
