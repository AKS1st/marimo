/* Copyright 2026 Marimo. All rights reserved. */
import { type Platform, resolvePlatform } from "@/core/hotkeys/shortcuts";
import { Objects } from "@/utils/objects";

export const NOT_SET: unique symbol = Symbol("NOT_SET");

export interface Hotkey {
  name: string;
  /**
   * Grouping for the command palette and keyboard shortcuts page.
   * If not specified, the command will not be shown in the command palette.
   */
  group: HotkeyGroup | undefined;
  key:
    | string
    | typeof NOT_SET
    | {
        main: string;
        /** macOS specific override */
        mac?: string;
        /** Windows specific override */
        windows?: string;
        /** Linux specific override */
        linux?: string;
      };
  /**
   * @default true
   */
  editable?: boolean;
  additionalKeywords?: string[];
}

interface ResolvedHotkey {
  name: string;
  key: string;
  additionalKeywords?: string[];
}

type ModKey = "Cmd" | "Ctrl";

export type HotkeyGroup =
  | "Running Cells"
  | "Creation and Ordering"
  | "Navigation"
  | "Editing"
  | "Markdown"
  | "Command"
  | "Other";

const DEFAULT_HOT_KEY = {
  // Cell Navigation
  "cell.focusUp": {
    name: "跳到上一个单元格",
    group: "Navigation",
    key: "Mod-Shift-k",
  },
  "cell.focusDown": {
    name: "跳到下一个单元格",
    group: "Navigation",
    key: "Mod-Shift-j",
  },

  // Creation and Ordering
  "cell.moveUp": {
    name: "上移单元格",
    group: "Creation and Ordering",
    key: "Mod-Shift-9",
  },
  "cell.moveDown": {
    name: "下移单元格",
    group: "Creation and Ordering",
    key: "Mod-Shift-0",
  },
  "cell.moveLeft": {
    name: "左移",
    group: "Creation and Ordering",
    key: "Mod-Shift-7",
  },
  "cell.moveRight": {
    name: "右移",
    group: "Creation and Ordering",
    key: "Mod-Shift-8",
  },
  "cell.createAbove": {
    name: "在上方新建单元格",
    group: "Creation and Ordering",
    key: "Mod-Shift-o",
  },
  "cell.createBelow": {
    name: "在下方新建单元格",
    group: "Creation and Ordering",
    key: "Mod-Shift-p",
  },
  "cell.sendToTop": {
    name: "移到顶部",
    group: "Creation and Ordering",
    key: "Mod-Shift-1",
  },
  "cell.sendToBottom": {
    name: "移到底部",
    group: "Creation and Ordering",
    key: "Mod-Shift-2",
  },
  "cell.addColumnBreakpoint": {
    name: "添加列断点",
    group: "Creation and Ordering",
    key: "Mod-Shift-3",
  },

  // Running Cells
  "cell.run": {
    name: "运行",
    group: "Running Cells",
    key: "Mod-Enter",
    additionalKeywords: ["execute", "submit"],
  },
  "cell.runAndNewBelow": {
    name: "运行并在下方新建",
    group: "Running Cells",
    key: "Shift-Enter",
  },
  "cell.runAndNewAbove": {
    name: "运行并在上方新建",
    group: "Running Cells",
    key: "Mod-Shift-Enter",
  },
  "global.runAll": {
    name: "重新运行所有单元格",
    group: "Running Cells",
    key: NOT_SET,
  },

  // Editing Cells
  "cell.format": {
    name: "格式化单元格",
    group: "Editing",
    key: "Mod-b",
    additionalKeywords: ["lint"],
  },
  "cell.viewAsMarkdown": {
    name: "切换为 Markdown",
    group: "Editing",
    key: "Mod-Shift-m",
  },
  "cell.viewAsSQL": {
    name: "切换 SQL",
    group: "Editing",
    key: {
      windows: "Alt-Shift-l",
      main: "Mod-Shift-l",
    },
  },
  "cell.complete": {
    name: "代码补全",
    group: "Editing",
    key: "Ctrl-Space",
  },
  "cell.signatureHelp": {
    name: "签名帮助",
    group: "Editing",
    key: "Mod-Shift-Space",
  },
  "cell.undo": {
    name: "撤销",
    group: "Editing",
    key: "Mod-z",
  },
  "cell.redo": {
    name: "重做",
    group: "Editing",
    key: {
      main: "Mod-Shift-z",
      windows: "Mod-y",
    },
  },
  "cell.findAndReplace": {
    name: "查找和替换",
    group: "Editing",
    key: "Mod-f",
  },
  "cell.selectNextOccurrence": {
    name: "将选择添加到下一个匹配项",
    group: "Editing",
    key: "Mod-d",
  },
  "cell.fold": {
    name: "折叠区域",
    group: "Editing",
    key: {
      main: "Mod-Alt-[",
      windows: "Mod-Shift-[",
    },
  },
  "cell.unfold": {
    name: "展开区域",
    group: "Editing",
    key: {
      main: "Mod-Alt-]",
      windows: "Mod-Shift-]",
    },
  },
  "cell.foldAll": {
    name: "折叠所有区域",
    group: "Editing",
    key: "Ctrl-Alt-[",
  },
  "cell.unfoldAll": {
    name: "展开所有区域",
    group: "Editing",
    key: "Ctrl-Alt-]",
  },
  "cell.delete": {
    name: "删除单元格",
    group: "Editing",
    key: "Shift-Backspace",
    additionalKeywords: ["remove"],
  },
  "cell.hideCode": {
    name: "隐藏单元格代码",
    group: "Editing",
    key: "Mod-h",
  },
  "cell.aiCompletion": {
    name: "AI 补全",
    group: "Editing",
    key: "Mod-Shift-e",
  },
  "cell.cellActions": {
    name: "打开单元格操作",
    group: "Editing",
    key: "Mod-p",
  },
  "cell.splitCell": {
    name: "拆分单元格",
    group: "Editing",
    key: "Mod-Shift-'",
  },
  "cell.toggleComment": {
    name: "切换注释",
    group: "Editing",
    // https://github.com/codemirror/commands/blob/6.8.1/src/commands.ts#L1067
    key: "Mod-/",
  },
  "cell.toggleBlockComment": {
    name: "切换块注释",
    group: "Editing",
    // https://github.com/codemirror/commands/blob/6.8.1/src/commands.ts#L1068
    key: "Alt-A",
  },
  "cell.renameSymbol": {
    name: "重命名符号",
    group: "Editing",
    key: "F2",
  },
  "cell.copyLineUp": {
    name: "向上复制行",
    group: "Editing",
    key: "Alt-Shift-ArrowUp",
    editable: false,
  },
  "cell.copyLineDown": {
    name: "向下复制行",
    group: "Editing",
    key: "Alt-Shift-ArrowDown",
    editable: false,
  },

  // Markdown
  "markdown.bold": {
    name: "加粗",
    group: "Markdown",
    key: "Mod-b",
  },
  "markdown.italic": {
    name: "斜体",
    group: "Markdown",
    key: "Mod-i",
  },
  "markdown.link": {
    name: "转换为链接",
    group: "Markdown",
    key: "Mod-k",
  },
  "markdown.orderedList": {
    name: "转换为有序列表",
    group: "Markdown",
    key: "Mod-Shift-7",
  },
  "markdown.unorderedList": {
    name: "转换为无序列表",
    group: "Markdown",
    key: "Mod-Shift-8",
  },
  "markdown.blockquote": {
    name: "转换为引用",
    group: "Markdown",
    key: "Mod-Shift-9",
  },
  "markdown.code": {
    name: "转换为代码",
    group: "Markdown",
    key: "Mod-Shift-0",
  },

  // Global Actions
  "global.hideCode": {
    name: "切换应用视图",
    group: "Other",
    key: "Mod-.",
  },
  "global.foldCode": {
    name: "折叠所有单元格",
    group: "Editing",
    key: {
      main: "Ctrl-Cmd-l",
      windows: "Mod-Shift-l",
    },
  },
  "global.unfoldCode": {
    name: "展开所有单元格",
    group: "Editing",
    key: {
      main: "Ctrl-Cmd-;",
      windows: "Mod-Shift-:",
    },
  },
  "global.showHelp": {
    name: "显示键盘快捷键",
    group: "Other",
    key: "Mod-Shift-h",
  },
  "global.save": {
    name: "保存文件",
    group: "Other",
    key: "Mod-s",
    additionalKeywords: ["write", "persist"],
  },
  "global.commandPalette": {
    name: "打开命令面板",
    group: "Other",
    key: "Mod-k",
  },
  "global.runStale": {
    name: "运行所有过期单元格",
    group: "Running Cells",
    key: "Mod-Shift-r",
  },
  "global.interrupt": {
    name: "停止（中断）执行",
    group: "Running Cells",
    key: "Mod-i",
  },
  "global.formatAll": {
    name: "全部格式化",
    group: "Editing",
    key: "Mod-Shift-b",
  },
  "global.toggleLanguage": {
    name: "切换为 Markdown 语言（如果支持）",
    group: "Editing",
    key: "F4",
  },
  "global.toggleTerminal": {
    name: "显示集成终端",
    group: "Other",
    key: "Ctrl-`",
  },
  "global.togglePanel": {
    name: "切换开发者面板",
    group: "Other",
    key: "Mod-j",
  },
  "global.collapseAllSections": {
    name: "折叠所有章节",
    group: "Editing",
    key: "Mod-Shift-\\",
  },
  "global.expandAllSections": {
    name: "展开所有章节",
    group: "Editing",
    key: "Mod-Shift-/",
  },
  "global.toggleMinimap": {
    name: "切换缩略图",
    group: "Other",
    key: "Mod-Shift-i",
  },

  // Global Navigation
  "global.focusTop": {
    name: "聚焦顶部",
    group: "Navigation",
    key: "Mod-Shift-f",
  },
  "global.focusBottom": {
    name: "聚焦底部",
    group: "Navigation",
    key: "Mod-Shift-g",
  },
  "global.toggleSidebar": {
    name: "切换辅助面板",
    group: "Navigation",
    key: "Mod-Shift-s",
  },
  "cell.goToDefinition": {
    name: "跳转到定义",
    group: "Navigation",
    key: "F12",
  },
  "completion.moveDown": {
    name: "向下移动补全选择",
    group: "Editing",
    key: "Ctrl-j",
  },
  "completion.moveUp": {
    name: "向上移动补全选择",
    group: "Editing",
    key: "Ctrl-k",
  },

  // Command mode (edit a cell, not the editor)
  "command.vimEnterCommandMode": {
    name: "进入命令模式（vim）",
    group: "Command",
    key: {
      main: "Mod-Escape",
      windows: "Shift-Escape",
    },
  },
  "command.createCellBefore": {
    name: "在当前单元格前创建单元格",
    group: "Command",
    key: "a",
  },
  "command.createCellAfter": {
    name: "在当前单元格后创建单元格",
    group: "Command",
    key: "b",
  },
  "command.copyCell": {
    name: "复制单元格",
    group: "Command",
    key: "c",
  },
  "command.pasteCell": {
    name: "粘贴单元格",
    group: "Command",
    key: "v",
  },
} satisfies Record<string, Hotkey>;

export type HotkeyAction = keyof typeof DEFAULT_HOT_KEY;

export function isHotkeyAction(x: string): x is HotkeyAction {
  return x in DEFAULT_HOT_KEY;
}

export function getDefaultHotkey(action: HotkeyAction): ResolvedHotkey {
  return new HotkeyProvider(DEFAULT_HOT_KEY).getHotkey(action);
}
export interface IHotkeyProvider {
  getHotkey(action: HotkeyAction): ResolvedHotkey;
}

interface HotkeyProviderOptions {
  /**
   * The target platform for the key provider.
   *
   * If `undefined`, the platform is detected at runtime.
   * An explicit value is generally only provided in tests.
   */
  platform?: Platform;
}

export class HotkeyProvider implements IHotkeyProvider {
  private mod: ModKey;
  private platform: Platform;

  /**
   * @param platform - See {@link HotkeyProviderOptions.platform}.
   */
  static create(platform?: Platform): HotkeyProvider {
    return new HotkeyProvider(DEFAULT_HOT_KEY, { platform });
  }

  private hotkeys: Record<HotkeyAction, Hotkey>;

  constructor(
    hotkeys: Record<HotkeyAction, Hotkey>,
    options: HotkeyProviderOptions = {},
  ) {
    this.hotkeys = hotkeys;
    this.platform = options.platform ?? resolvePlatform();
    this.mod = this.platform === "mac" ? "Cmd" : "Ctrl";
  }

  iterate(): HotkeyAction[] {
    return Objects.keys(this.hotkeys);
  }

  getHotkey(action: HotkeyAction): ResolvedHotkey {
    const { name, key, additionalKeywords } = this.hotkeys[action];
    if (typeof key === "string") {
      return {
        name,
        key: key.replace("Mod", this.mod),
        additionalKeywords,
      };
    }
    if (key === NOT_SET) {
      return {
        name,
        key: "",
        additionalKeywords,
      };
    }
    const platformKey = key[this.platform] || key.main;
    return {
      name,
      key: platformKey.replace("Mod", this.mod),
      additionalKeywords,
    };
  }

  getHotkeyDisplay(action: HotkeyAction): string {
    return this.hotkeys[action].name;
  }

  isEditable(action: HotkeyAction): boolean {
    return this.hotkeys[action].editable !== false;
  }

  getHotkeyGroups(): Record<HotkeyGroup, HotkeyAction[]> {
    return Objects.groupBy(
      Objects.entries(this.hotkeys),
      ([, hotkey]) => hotkey.group,
      ([action]) => action,
    );
  }
}

export class OverridingHotkeyProvider extends HotkeyProvider {
  private readonly overrides: Partial<Record<HotkeyAction, string | undefined>>;

  constructor(
    overrides: Partial<Record<HotkeyAction, string | undefined>>,
    options: HotkeyProviderOptions = {},
  ) {
    super(DEFAULT_HOT_KEY, options);
    this.overrides = overrides;
  }

  override getHotkey(action: HotkeyAction): ResolvedHotkey {
    const base = super.getHotkey(action);
    const override = this.overrides[action];
    return {
      name: base.name,
      key: override ? normalizeKeyString(override) : base.key,
      additionalKeywords: base.additionalKeywords,
    };
  }
}

const MODIFIER_RE = /^(cmd|ctrl|alt|shift|meta|mod)$/i;

/**
 * Capitalize multi-character base key names so they match the
 * casing that KeyboardEvent.key (and therefore CodeMirror) uses.
 * e.g. "Shift-enter" → "Shift-Enter", "Cmd-backspace" → "Cmd-Backspace"
 */
export function normalizeKeyString(key: string): string {
  const parts = key.split("-");
  const last = parts[parts.length - 1];
  if (last.length > 1 && !MODIFIER_RE.test(last)) {
    parts[parts.length - 1] = last.charAt(0).toUpperCase() + last.slice(1);
  }
  return parts.join("-");
}
