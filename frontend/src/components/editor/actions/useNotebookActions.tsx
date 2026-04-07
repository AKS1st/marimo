/* Copyright 2026 Marimo. All rights reserved. */

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  BookMarkedIcon,
  CheckIcon,
  ChevronDownCircleIcon,
  ChevronRightCircleIcon,
  ClipboardCopyIcon,
  CodeIcon,
  CommandIcon,
  DatabaseIcon,
  DiamondPlusIcon,
  DownloadIcon,
  EditIcon,
  ExternalLinkIcon,
  EyeOffIcon,
  FastForwardIcon,
  FileIcon,
  Files,
  FileTextIcon,
  FolderDownIcon,
  GithubIcon,
  GlobeIcon,
  HardDrive,
  Home,
  ImageIcon,
  KeyboardIcon,
  LayoutTemplateIcon,
  LinkIcon,
  MessagesSquareIcon,
  NotebookIcon,
  PanelLeftIcon,
  PowerSquareIcon,
  PresentationIcon,
  SettingsIcon,
  Share2Icon,
  SparklesIcon,
  Undo2Icon,
  XCircleIcon,
  YoutubeIcon,
  ZapIcon,
} from "lucide-react";
import { settingDialogAtom } from "@/components/app-config/state";
import { MarkdownIcon } from "@/components/editor/cell/code/icons";
import { MarimoPlusIcon } from "@/components/icons/marimo-icons";
import { useImperativeModal } from "@/components/modal/ImperativeModal";
import { renderShortcut } from "@/components/shortcuts/renderShortcut";
import { PairWithAgentModal } from "@/components/editor/actions/pair-with-agent-modal";
import { ShareStaticNotebookModal } from "@/components/static-html/share-modal";
import { toast } from "@/components/ui/use-toast";
import {
  canUndoDeletesAtom,
  getNotebook,
  hasDisabledCellsAtom,
  useCellActions,
} from "@/core/cells/cells";
import { disabledCellIds } from "@/core/cells/utils";
import { useResolvedMarimoConfig } from "@/core/config/config";
import { Constants } from "@/core/constants";
import {
  updateCellOutputsWithScreenshots,
  useEnrichCellOutputs,
} from "@/core/export/hooks";
import { useLayoutActions, useLayoutState } from "@/core/layout/layout";
import { useTogglePresenting } from "@/core/layout/useTogglePresenting";
import { kioskModeAtom, viewStateAtom } from "@/core/mode";
import { useRequestClient } from "@/core/network/requests";
import { useFilename } from "@/core/saving/filename";
import { downloadAsHTML } from "@/core/static/download-html";
import { createShareableLink } from "@/core/wasm/share";
import { isWasm } from "@/core/wasm/utils";
import { copyToClipboard } from "@/utils/copy";
import {
  ADD_PRINTING_CLASS,
  downloadAsPDF,
  downloadBlob,
  downloadHTMLAsImage,
  withLoadingToast,
} from "@/utils/download";
import { Filenames } from "@/utils/filenames";
import { Objects } from "@/utils/objects";
import type { ProgressState } from "@/utils/progress";
import { Strings } from "@/utils/strings";
import { newNotebookURL } from "@/utils/urls";
import { useRunAllCells } from "../cell/useRunCells";
import { useChromeActions, useChromeState } from "../chrome/state";
import { PANELS } from "../chrome/types";
import { AddConnectionDialogContent } from "../connections/add-connection-dialog";
import { keyboardShortcutsAtom } from "../controls/keyboard-shortcuts";
import { commandPaletteAtom } from "../controls/state";
import { displayLayoutName, getLayoutIcon } from "../renderers/layout-select";
import { LAYOUT_TYPES } from "../renderers/types";
import { runServerSidePDFDownload } from "./pdf-export";
import type { ActionButton } from "./types";
import { useCopyNotebook } from "./useCopyNotebook";
import { useHideAllMarkdownCode } from "./useHideAllMarkdownCode";
import { useRestartKernel } from "./useRestartKernel";

const NOOP_HANDLER = (event?: Event) => {
  event?.preventDefault();
  event?.stopPropagation();
};

export function useNotebookActions() {
  const filename = useFilename();
  const { openModal, closeModal } = useImperativeModal();
  const { toggleApplication } = useChromeActions();
  const { selectedPanel } = useChromeState();
  const [viewState] = useAtom(viewStateAtom);
  const kioskMode = useAtomValue(kioskModeAtom);
  const hideAllMarkdownCode = useHideAllMarkdownCode();
  const [resolvedConfig] = useResolvedMarimoConfig();

  const {
    updateCellConfig,
    undoDeleteCell,
    clearAllCellOutputs,
    addSetupCellIfDoesntExist,
    collapseAllCells,
    expandAllCells,
  } = useCellActions();
  const restartKernel = useRestartKernel();
  const runAllCells = useRunAllCells();
  const copyNotebook = useCopyNotebook(filename);
  const setCommandPaletteOpen = useSetAtom(commandPaletteAtom);
  const setSettingsDialogOpen = useSetAtom(settingDialogAtom);
  const setKeyboardShortcutsOpen = useSetAtom(keyboardShortcutsAtom);
  const {
    exportAsIPYNB,
    exportAsMarkdown,
    readCode,
    saveCellConfig,
    updateCellOutputs,
  } = useRequestClient();
  const takeScreenshots = useEnrichCellOutputs();

  const hasDisabledCells = useAtomValue(hasDisabledCellsAtom);
  const canUndoDeletes = useAtomValue(canUndoDeletesAtom);
  const { selectedLayout } = useLayoutState();
  const { setLayoutView } = useLayoutActions();
  const togglePresenting = useTogglePresenting();
  // Fallback: if sharing is undefined, both are enabled by default
  const sharingHtmlEnabled = resolvedConfig.sharing?.html ?? true;
  const sharingWasmEnabled = resolvedConfig.sharing?.wasm ?? true;

  // Server-side PDF export is always available outside WASM.
  // Browser print fallback is used in WASM.
  const serverSidePdfEnabled = !isWasm();
  const isSlidesLayout = selectedLayout === "slides";

  const renderCheckboxElement = (checked: boolean) => (
    <div className="w-8 flex justify-end">
      {checked && <CheckIcon size={14} />}
    </div>
  );

  const renderRecommendedElement = (recommended: boolean) => {
    if (!recommended) {
      return null;
    }
    return (
      <span className="ml-3 shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
        Recommended
      </span>
    );
  };

  const downloadServerSidePDF = async ({
    preset,
    title,
  }: {
    preset: "document" | "slides";
    title: string;
  }) => {
    if (!filename) {
      toastNotebookMustBeNamed();
      return;
    }

    const runDownload = async (progress: ProgressState) => {
      await updateCellOutputsWithScreenshots({
        takeScreenshots: () => takeScreenshots({ progress }),
        updateCellOutputs,
      });
      await runServerSidePDFDownload({
        filename,
        preset,
        downloadPDF: downloadAsPDF,
      });
    };
    await withLoadingToast(title, runDownload);
  };

  const handleDocumentPDF = async () => {
    if (serverSidePdfEnabled) {
      await downloadServerSidePDF({
        preset: "document",
        title: "正在下载文档 PDF...",
      });
      return;
    }
    const beforeprint = new Event("export-beforeprint");
    const afterprint = new Event("export-afterprint");
    window.dispatchEvent(beforeprint);
    setTimeout(() => window.print(), 0);
    setTimeout(() => window.dispatchEvent(afterprint), 0);
  };

  const handleDownloadAsIPYNB = async () => {
    if (!filename) {
      toastNotebookMustBeNamed();
      return;
    }

    const runDownload = async (progress: ProgressState) => {
      await updateCellOutputsWithScreenshots({
        takeScreenshots: () => takeScreenshots({ progress }),
        updateCellOutputs,
      });
      const ipynb = await exportAsIPYNB({ download: false });
      downloadBlob(
        new Blob([ipynb], { type: "application/x-ipynb+json" }),
        Filenames.toIPYNB(document.title),
      );
    };

    await withLoadingToast("正在下载 IPYNB...", runDownload);
  };

  const actions: ActionButton[] = [
    {
      icon: <DownloadIcon size={14} strokeWidth={1.5} />,
      label: "下载",
      handle: NOOP_HANDLER,
      dropdown: [
        {
          icon: <FolderDownIcon size={14} strokeWidth={1.5} />,
          label: "下载为 HTML",
          handle: async () => {
            if (!filename) {
              toastNotebookMustBeNamed();
              return;
            }
            await downloadAsHTML({ filename, includeCode: true });
          },
        },
        {
          icon: <FolderDownIcon size={14} strokeWidth={1.5} />,
          label: "下载为 HTML（不含代码）",
          handle: async () => {
            if (!filename) {
              toastNotebookMustBeNamed();
              return;
            }
            await downloadAsHTML({ filename, includeCode: false });
          },
        },
        {
          icon: (
            <MarkdownIcon strokeWidth={1.5} style={{ width: 14, height: 14 }} />
          ),
          label: "下载为 Markdown",
          handle: async () => {
            const md = await exportAsMarkdown({ download: false });
            downloadBlob(
              new Blob([md], { type: "text/plain" }),
              Filenames.toMarkdown(document.title),
            );
          },
        },
        {
          icon: <NotebookIcon size={14} strokeWidth={1.5} />,
          label: "下载为 ipynb",
          handle: handleDownloadAsIPYNB,
        },
        {
          icon: <CodeIcon size={14} strokeWidth={1.5} />,
          label: "下载 Python 代码",
          handle: async () => {
            const code = await readCode();
            downloadBlob(
              new Blob([code.contents], { type: "text/plain" }),
              Filenames.toPY(document.title),
            );
          },
        },
        {
          divider: true,
          icon: <ImageIcon size={14} strokeWidth={1.5} />,
          label: "下载为 PNG",
          disabled: viewState.mode !== "present",
          tooltip:
            viewState.mode === "present" ? undefined : (
                  <span>
                    仅在应用视图中可用。<br />
                    可通过以下快捷键切换：{renderShortcut("global.hideCode", false)}
                  </span>
            ),
          handle: async () => {
            const app = document.getElementById("App");
            if (!app) {
              return;
            }
            await downloadHTMLAsImage({
              element: app,
              filename: document.title,
              // Add body.printing ONLY when converting the whole notebook to a screenshot
              prepare: ADD_PRINTING_CLASS,
            });
          },
        },
        isSlidesLayout
          ? {
              divider: true,
              icon: <FileIcon size={14} strokeWidth={1.5} />,
              label: "下载为 PDF",
              handle: NOOP_HANDLER,
              dropdown: [
                {
                  icon: <FileIcon size={14} strokeWidth={1.5} />,
                  label: "文档布局",
                  handle: handleDocumentPDF,
                },
                {
                  icon: <FileIcon size={14} strokeWidth={1.5} />,
                  label: "幻灯片布局",
                  rightElement: renderRecommendedElement(true),
                  hidden: !serverSidePdfEnabled,
                  handle: async () => {
                    await downloadServerSidePDF({
                      preset: "slides",
                      title: "正在下载幻灯片 PDF...",
                    });
                  },
                },
              ],
            }
          : {
              divider: true,
              icon: <FileIcon size={14} strokeWidth={1.5} />,
              label: "下载为 PDF",
              handle: handleDocumentPDF,
            },
      ],
    },

    {
      icon: <SparklesIcon size={14} strokeWidth={1.5} />,
      label: "与智能体协作",
      handle: async () => {
        openModal(<PairWithAgentModal onClose={closeModal} />);
      },
    },

    {
      icon: <Share2Icon size={14} strokeWidth={1.5} />,
      label: "分享",
      handle: NOOP_HANDLER,
      hidden: !sharingHtmlEnabled && !sharingWasmEnabled,
      dropdown: [
        {
          icon: <GlobeIcon size={14} strokeWidth={1.5} />,
          label: "发布 HTML 到网页",
          hidden: !sharingHtmlEnabled,
          handle: async () => {
            openModal(<ShareStaticNotebookModal onClose={closeModal} />);
          },
        },
        {
          icon: <LinkIcon size={14} strokeWidth={1.5} />,
          label: "创建 WebAssembly 链接",
          hidden: !sharingWasmEnabled,
          handle: async () => {
            const code = await readCode();
            const url = createShareableLink({ code: code.contents });
            await copyToClipboard(url);
            toast({
              title: "已复制",
              description: "链接已复制到剪贴板。",
            });
          },
        },
      ],
    },

    {
      icon: <PanelLeftIcon size={14} strokeWidth={1.5} />,
      label: "辅助面板",
      redundant: true,
      handle: NOOP_HANDLER,
      dropdown: PANELS.flatMap(
        ({ type: id, Icon, hidden, additionalKeywords }) => {
          if (hidden) {
            return [];
          }
          return {
            label: Strings.startCase(id),
            rightElement: renderCheckboxElement(selectedPanel === id),
            icon: <Icon size={14} strokeWidth={1.5} />,
            handle: () => toggleApplication(id),
            additionalKeywords,
          };
        },
      ),
    },

    {
      icon: <PresentationIcon size={14} strokeWidth={1.5} />,
      label: "展示为",
      handle: NOOP_HANDLER,
      dropdown: [
        {
          icon:
            viewState.mode === "present" ? (
              <EditIcon size={14} strokeWidth={1.5} />
            ) : (
              <LayoutTemplateIcon size={14} strokeWidth={1.5} />
            ),
          label: "切换应用视图",
          hotkey: "global.hideCode",
          handle: () => {
            togglePresenting();
          },
        },
        ...LAYOUT_TYPES.map((type, idx) => {
          const Icon = getLayoutIcon(type);
          return {
            divider: idx === 0,
            label: displayLayoutName(type),
            icon: <Icon size={14} strokeWidth={1.5} />,
            rightElement: (
              <div className="w-8 flex justify-end">
                {selectedLayout === type && <CheckIcon size={14} />}
              </div>
            ),
            handle: () => {
              setLayoutView(type);
              // Toggle if it's not in present mode
              if (viewState.mode === "edit") {
                togglePresenting();
              }
            },
          };
        }),
      ],
    },
    {
      icon: <Files size={14} strokeWidth={1.5} />,
      label: "复制 notebook",
      hidden: !filename || isWasm(),
      handle: copyNotebook,
    },
    {
      icon: <ClipboardCopyIcon size={14} strokeWidth={1.5} />,
      label: "复制代码到剪贴板",
      hidden: !filename,
      handle: async () => {
        const code = await readCode();
        await copyToClipboard(code.contents);
        toast({
          title: "已复制",
          description: "代码已复制到剪贴板。",
        });
      },
    },
    {
      icon: <ZapIcon size={14} strokeWidth={1.5} />,
      label: "启用所有单元格",
      hidden: !hasDisabledCells || kioskMode,
      handle: async () => {
        const notebook = getNotebook();
        const ids = disabledCellIds(notebook);
        const newConfigs = Objects.fromEntries(
          ids.map((cellId) => [cellId, { disabled: false }]),
        );
        // send to BE
        await saveCellConfig({ configs: newConfigs });
        // update on FE
        for (const cellId of ids) {
          updateCellConfig({ cellId, config: { disabled: false } });
        }
      },
    },

    {
      divider: true,
      icon: <DiamondPlusIcon size={14} strokeWidth={1.5} />,
      label: "添加设置单元格",
      handle: () => {
        addSetupCellIfDoesntExist({});
      },
    },
    {
      icon: <DatabaseIcon size={14} strokeWidth={1.5} />,
      label: "添加数据库连接",
      handle: () => {
        openModal(<AddConnectionDialogContent onClose={closeModal} />);
      },
    },
    {
      icon: <HardDrive size={14} strokeWidth={1.5} />,
      label: "添加远程存储",
      handle: () => {
        openModal(
          <AddConnectionDialogContent
            defaultTab="storage"
            onClose={closeModal}
          />,
        );
      },
    },
    {
      icon: <Undo2Icon size={14} strokeWidth={1.5} />,
      label: "撤销单元格删除",
      hidden: !canUndoDeletes || kioskMode,
      handle: () => {
        undoDeleteCell();
      },
    },
    {
      icon: <PowerSquareIcon size={14} strokeWidth={1.5} />,
      label: "重启内核",
      variant: "danger",
      handle: restartKernel,
      additionalKeywords: ["reset", "reload", "restart"],
    },
    {
      icon: <FastForwardIcon size={14} strokeWidth={1.5} />,
      label: "重新运行所有单元格",
      redundant: true,
      hotkey: "global.runAll",
      handle: async () => {
        runAllCells();
      },
    },
    {
      icon: <XCircleIcon size={14} strokeWidth={1.5} />,
      label: "清空所有输出",
      redundant: true,
      handle: () => {
        clearAllCellOutputs();
      },
    },
    {
      icon: <EyeOffIcon size={14} strokeWidth={1.5} />,
      label: "隐藏所有 markdown 代码",
      handle: hideAllMarkdownCode,
      redundant: true, // hidden by default
    },
    {
      icon: <ChevronRightCircleIcon size={14} strokeWidth={1.5} />,
      label: "折叠所有章节",
      hotkey: "global.collapseAllSections",
      handle: collapseAllCells,
      redundant: true,
    },
    {
      icon: <ChevronDownCircleIcon size={14} strokeWidth={1.5} />,
      label: "展开所有章节",
      hotkey: "global.expandAllSections",
      handle: expandAllCells,
      redundant: true,
    },
    {
      divider: true,
      icon: <CommandIcon size={14} strokeWidth={1.5} />,
      label: "命令面板",
      hotkey: "global.commandPalette",
      handle: () => setCommandPaletteOpen((open) => !open),
    },

    {
      icon: <KeyboardIcon size={14} strokeWidth={1.5} />,
      label: "键盘快捷键",
      hotkey: "global.showHelp",
      handle: () => setKeyboardShortcutsOpen((open) => !open),
    },
    {
      icon: <SettingsIcon size={14} strokeWidth={1.5} />,
      label: "用户设置",
      handle: () => setSettingsDialogOpen((open) => !open),
      redundant: true,
      additionalKeywords: ["preferences", "options", "configuration"],
    },
    {
      icon: <ExternalLinkIcon size={14} strokeWidth={1.5} />,
      label: "资源",
      handle: NOOP_HANDLER,
      dropdown: [
        {
          icon: <BookMarkedIcon size={14} strokeWidth={1.5} />,
          label: "文档",
          handle: () => {
            window.open(Constants.docsPage, "_blank");
          },
        },
        {
          icon: <GithubIcon size={14} strokeWidth={1.5} />,
          label: "GitHub",
          handle: () => {
            window.open(Constants.githubPage, "_blank");
          },
        },
        {
          icon: <MessagesSquareIcon size={14} strokeWidth={1.5} />,
          label: "Discord 社区",
          handle: () => {
            window.open(Constants.discordLink, "_blank");
          },
        },
        {
          icon: <YoutubeIcon size={14} strokeWidth={1.5} />,
          label: "YouTube",
          handle: () => {
            window.open(Constants.youtube, "_blank");
          },
        },
        {
          icon: <FileTextIcon size={14} strokeWidth={1.5} />,
          label: "更新日志",
          handle: () => {
            window.open(Constants.releasesPage, "_blank");
          },
        },
      ],
    },

    {
      divider: true,
      icon: <Home size={14} strokeWidth={1.5} />,
      label: "返回主页",
      // If file is in the url, then we ran `marimo edit`
      // without a specific file
      hidden: !location.search.includes("file"),
      handle: () => {
        const withoutSearch = document.baseURI.split("?")[0];
        window.open(withoutSearch, "_self");
      },
    },

    {
      icon: <MarimoPlusIcon size={14} strokeWidth={1.5} />,
      label: "新建 notebook",
      // If file is in the url, then we ran `marimo edit`
      // without a specific file
      hidden: !location.search.includes("file"),
      handle: () => {
        const url = newNotebookURL();
        window.open(url, "_blank");
      },
    },
  ];

  return actions
    .filter((a) => !a.hidden)
    .map((action) => {
      if (action.dropdown) {
        return {
          ...action,
          dropdown: action.dropdown.filter((item) => !item.hidden),
        };
      }
      return action;
    });
}

function toastNotebookMustBeNamed() {
  toast({
    title: "Error",
    description: "Notebooks must be named to be exported.",
    variant: "danger",
  });
}
