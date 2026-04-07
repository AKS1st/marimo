/* Copyright 2026 Marimo. All rights reserved. */

import { CaretDownIcon } from "@radix-ui/react-icons";
import {
  ActivityIcon,
  BarChart2Icon,
  BookMarkedIcon,
  BookOpenIcon,
  DatabaseIcon,
  FileIcon,
  FileTextIcon,
  GithubIcon,
  GraduationCapIcon,
  GridIcon,
  LayoutIcon,
  LinkIcon,
  MessagesSquareIcon,
  OrbitIcon,
  YoutubeIcon,
} from "lucide-react";
import type React from "react";
import { MarkdownIcon } from "@/components/editor/cell/code/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Constants } from "@/core/constants";
import { useRequestClient } from "@/core/network/requests";
import type { TutorialId } from "@/core/network/types";
import { openNotebook } from "@/utils/links";
import { Objects } from "@/utils/objects";

const TUTORIALS: Record<
  TutorialId,
  [string, React.FC<React.SVGProps<SVGSVGElement>>, string]
> = {
  intro: ["介绍", BookOpenIcon, "快速上手 marimo 基础用法"],
  dataflow: [
    "数据流",
    ActivityIcon,
    "了解单元格如何相互作用",
  ],
  ui: ["UI 元素", LayoutIcon, "创建交互式 UI 组件"],
  markdown: [
    "Markdown",
    FileTextIcon,
    "使用参数化 markdown 格式化文本",
  ],
  plots: ["图表", BarChart2Icon, "创建交互式可视化"],
  sql: ["SQL", DatabaseIcon, "在 marimo 中直接查询数据库"],
  layout: ["布局", GridIcon, "自定义单元格输出的布局"],
  fileformat: [
    "文件格式",
    FileIcon,
    "了解 marimo 的纯 Python 文件格式",
  ],
  "for-jupyter-users": [
    "给 Jupyter 用户",
    OrbitIcon,
    "从 Jupyter 迁移到 marimo",
  ],
  "markdown-format": [
    "Markdown 格式",
    MarkdownIcon,
    "使用 marimo 编辑 markdown 文件",
  ],
};

export const OpenTutorialDropDown: React.FC = () => {
  const { openTutorial } = useRequestClient();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button data-testid="open-tutorial-button" size="xs" variant="outline">
          <GraduationCapIcon className="w-4 h-4 mr-2" />
          教程
          <CaretDownIcon className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="print:hidden">
        {Objects.entries(TUTORIALS).map(
          ([tutorialId, [label, Icon, description]]) => (
            <DropdownMenuItem
              key={tutorialId}
              onSelect={async () => {
                const file = await openTutorial({ tutorialId });
                if (!file) {
                  return;
                }
                openNotebook(file.path);
              }}
            >
              <Icon
                strokeWidth={1.5}
                className="w-4 h-4 mr-3 self-start mt-1.5 text-muted-foreground"
              />
              <div className="flex items-center">
                <div className="flex flex-col">
                  <span>{label}</span>
                  <span className="text-xs text-muted-foreground pr-1">
                    {description}
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const RESOURCES = [
  {
    title: "文档",
    description: "marimo 官方文档和 API 参考",
    icon: BookMarkedIcon,
    url: Constants.docsPage,
  },
  {
    title: "GitHub",
    description: "查看源码、报告问题或参与贡献",
    icon: GithubIcon,
    url: Constants.githubPage,
  },
  {
    title: "社区",
    description: "加入 marimo 的 Discord 社区",
    icon: MessagesSquareIcon,
    url: Constants.discordLink,
  },
  {
    title: "YouTube",
    description: "观看教程和演示",
    icon: YoutubeIcon,
    url: Constants.youtube,
  },
  {
    title: "更新日志",
    description: "查看 marimo 的最新变化",
    icon: FileTextIcon,
    url: Constants.releasesPage,
  },
];

export const ResourceLinks: React.FC = () => {
  return (
    <div className="flex flex-col gap-2">
      <Header Icon={LinkIcon}>资源</Header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {RESOURCES.map((resource) => (
          <a
            key={resource.title}
            href={resource.url}
            target="_blank"
            className="flex items-start gap-3 py-3 px-3 rounded-lg border hover:bg-accent/20 transition-colors shadow-xs"
          >
            <resource.icon className="w-5 h-5 mt-1.5 text-primary" />
            <div>
              <h3 className="font-medium">{resource.title}</h3>
              <p className="text-sm text-muted-foreground">
                {resource.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export const Header: React.FC<{
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  control?: React.ReactNode;
  children: React.ReactNode;
}> = ({ Icon, control, children }) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-muted-foreground select-none">
        <Icon className="h-5 w-5" />
        {children}
      </h2>
      {control}
    </div>
  );
};
