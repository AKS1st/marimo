/* Copyright 2026 Marimo. All rights reserved. */

import { zodResolver } from "@hookform/resolvers/zod";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { merge } from "lodash-es";
import {
  AlertTriangleIcon,
  BrainIcon,
  CpuIcon,
  EditIcon,
  FlaskConicalIcon,
  FolderCog2,
  LayersIcon,
  MonitorIcon,
} from "lucide-react";
import React, { useId, useRef } from "react";
import { useLocale } from "react-aria";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { acceptCompletionOnEnterAtom } from "@/core/codemirror/completion/accept-on-enter-atom";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Kbd } from "@/components/ui/kbd";
import { NativeSelect } from "@/components/ui/native-select";
import { NumberField } from "@/components/ui/number-field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KEYMAP_PRESETS } from "@/core/codemirror/keymaps/keymaps";
import { capabilitiesAtom } from "@/core/config/capabilities";
import { useUserConfig } from "@/core/config/config";
import {
  PackageManagerNames,
  type UserConfig,
  UserConfigSchema,
} from "@/core/config/config-schema";
import { getAppWidths } from "@/core/config/widths";
import { marimoVersionAtom } from "@/core/meta/state";
import { viewStateAtom } from "@/core/mode";
import { useRequestClient } from "@/core/network/requests";
import { isWasm } from "@/core/wasm/utils";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { Banner } from "@/plugins/impl/common/error-banner";
import { THEMES } from "@/theme/useTheme";
import { arrayToggle } from "@/utils/arrays";
import { cn } from "@/utils/cn";
import { autoPopulateModels } from "../ai/ai-utils";
import { keyboardShortcutsAtom } from "../editor/controls/keyboard-shortcuts";
import { Badge } from "../ui/badge";
import { ExternalLink } from "../ui/links";
import { Tooltip } from "../ui/tooltip";
import { AiConfig } from "./ai-config";
import { formItemClasses, SettingGroup } from "./common";
import { DataForm } from "./data-form";
import { applyManualInjections, getDirtyValues } from "./get-dirty-values";
import { IsOverridden } from "./is-overridden";
import { OptionalFeatures } from "./optional-features";

const categories = [
  {
    id: "editor",
    label: "编辑器",
    Icon: EditIcon,
    className: "bg-(--blue-4)",
  },
  {
    id: "display",
    label: "显示",
    Icon: MonitorIcon,
    className: "bg-(--grass-4)",
  },
  {
    id: "packageManagementAndData",
    label: "包与数据",
    Icon: LayersIcon,
    className: "bg-(--red-4)",
  },
  {
    id: "runtime",
    label: "运行时",
    Icon: CpuIcon,
    className: "bg-(--amber-4)",
  },
  {
    id: "ai",
    label: "AI",
    Icon: BrainIcon,
    className: "bg-[linear-gradient(45deg,var(--purple-5),var(--cyan-5))]",
  },
  {
    id: "optionalDeps",
    label: "可选依赖",
    Icon: FolderCog2,
    className: "bg-(--orange-4)",
  },
  {
    id: "labs",
    label: "实验功能",
    Icon: FlaskConicalIcon,
    className: "bg-(--slate-4)",
  },
] as const;

export type SettingCategoryId = (typeof categories)[number]["id"];

export const activeUserConfigCategoryAtom = atom<SettingCategoryId>(
  categories[0].id,
);

const FORM_DEBOUNCE = 100; // ms;
const LOCALE_SYSTEM_VALUE = "__system__";

export const UserConfigForm: React.FC = () => {
  const [config, setConfig] = useUserConfig();
  const [acceptOnEnter, setAcceptOnEnter] = useAtom(
    acceptCompletionOnEnterAtom,
  );
  const formElement = useRef<HTMLFormElement>(null);
  const setKeyboardShortcutsOpen = useSetAtom(keyboardShortcutsAtom);
  const [activeCategory, setActiveCategory] = useAtom(
    activeUserConfigCategoryAtom,
  );

  let capabilities = useAtomValue(capabilitiesAtom);
  const isHome = useAtomValue(viewStateAtom).mode === "home";
  // The home page does not fetch kernel capabilities, so we just turn them all on
  if (isHome) {
    capabilities = {
      terminal: true,
      pylsp: true,
      ty: true,
      basedpyright: true,
      pyrefly: true,
    };
  }

  const marimoVersion = useAtomValue(marimoVersionAtom);
  const { locale } = useLocale();
  const { saveUserConfig } = useRequestClient();

  // Create form
  const form = useForm({
    resolver: zodResolver(
      UserConfigSchema as unknown as z.ZodType<unknown, UserConfig>,
    ),
    defaultValues: config,
  });

  const setAiModels = (
    values: UserConfig["ai"],
    dirtyAiConfig: UserConfig["ai"],
  ) => {
    const { chatModel, editModel } = autoPopulateModels(values);
    if (chatModel || editModel) {
      dirtyAiConfig = {
        ...dirtyAiConfig,
        models: {
          ...dirtyAiConfig?.models,
          ...(chatModel && { chat_model: chatModel }),
          ...(editModel && { edit_model: editModel }),
        },
      } as typeof dirtyAiConfig;
      if (chatModel) {
        form.setValue("ai.models.chat_model", chatModel);
      }
      if (editModel) {
        form.setValue("ai.models.edit_model", editModel);
      }
    }

    return dirtyAiConfig;
  };

  const onSubmitNotDebounced = async (values: UserConfig) => {
    // Only send values that were actually changed to avoid
    // overwriting backend values the form doesn't manage
    const dirtyValues = getDirtyValues(values, form.formState.dirtyFields);
    applyManualInjections({
      values,
      dirtyValues,
      touchedFields: form.formState.touchedFields,
    });
    if (Object.keys(dirtyValues).length === 0) {
      return; // Nothing changed
    }

    // Auto-populate AI models when credentials are set, makes it easier to get started
    if (dirtyValues.ai) {
      dirtyValues.ai = setAiModels(values.ai, dirtyValues.ai);
    }

    await saveUserConfig({ config: dirtyValues });
    // Only apply the changed keys; this avoids stale request responses
    // overwriting newer config changes.
    setConfig((prev) => merge({}, prev, dirtyValues));
  };
  const onSubmit = useDebouncedCallback(onSubmitNotDebounced, FORM_DEBOUNCE);

  const isWasmRuntime = isWasm();
  const htmlCheckboxId = useId();
  const ipynbCheckboxId = useId();

  const renderBody = () => {
    switch (activeCategory) {
      case "editor":
        return (
          <>
            <SettingGroup title="自动保存">
              <FormField
                control={form.control}
                name="save.autosave"
                render={({ field }) => (
                  <FormItem className={formItemClasses}>
                    <FormLabel className="font-normal">
                      启用自动保存
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        data-testid="autosave-checkbox"
                        checked={field.value === "after_delay"}
                        disabled={field.disabled}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? "after_delay" : "off");
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <IsOverridden userConfig={config} name="save.autosave" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="save.autosave_delay"
                render={({ field }) => (
                  <FormItem className={formItemClasses}>
                    <FormLabel>自动保存延迟（秒）</FormLabel>
                    <FormControl>
                      <NumberField
                        aria-label="自动保存延迟"
                        data-testid="autosave-delay-input"
                        className="m-0 w-24"
                        isDisabled={
                          form.getValues("save.autosave") !== "after_delay"
                        }
                        {...field}
                        value={field.value / 1000}
                        minValue={1}
                        onChange={(value) => {
                          field.onChange(value * 1000);
                          if (!Number.isNaN(value)) {
                            onSubmit(form.getValues());
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <IsOverridden
                      userConfig={config}
                      name="save.autosave_delay"
                    />
                  </FormItem>
                )}
              />
              {/* auto_download is a runtime setting in the backend, but it makes
               * more sense as an autosave setting. */}
              <FormField
                control={form.control}
                name="runtime.default_auto_download"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-1">
                    <FormItem className={formItemClasses}>
                      <FormLabel>将单元格输出保存为</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={htmlCheckboxId}
                              checked={
                                Array.isArray(field.value) &&
                                field.value.includes("html")
                              }
                              onCheckedChange={() => {
                                const currentValue = Array.isArray(field.value)
                                  ? field.value
                                  : [];
                                field.onChange(
                                  arrayToggle(currentValue, "html"),
                                );
                              }}
                            />
                              <FormLabel htmlFor={htmlCheckboxId}>HTML</FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={ipynbCheckboxId}
                              checked={
                                Array.isArray(field.value) &&
                                field.value.includes("ipynb")
                              }
                              onCheckedChange={() => {
                                const currentValue = Array.isArray(field.value)
                                  ? field.value
                                  : [];
                                field.onChange(
                                  arrayToggle(currentValue, "ipynb"),
                                );
                              }}
                            />
                              <FormLabel htmlFor={ipynbCheckboxId}>
                              IPYNB
                            </FormLabel>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <IsOverridden
                        userConfig={config}
                        name="runtime.default_auto_download"
                      />
                    </FormItem>
                    <FormDescription>
                      启用后，marimo 会定期将 notebook 以所选格式（HTML、IPYNB）
                      保存到名为{" "}
                      <Kbd className="inline">__marimo__</Kbd> next to your
                      notebook 文件旁的文件夹中。
                    </FormDescription>
                  </div>
                )}
              />
            </SettingGroup>
            <SettingGroup title="格式化">
              <FormField
                control={form.control}
                name="save.format_on_save"
                render={({ field }) => (
                  <FormItem className={formItemClasses}>
                    <FormLabel className="font-normal">
                      保存时格式化
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        data-testid="format-on-save-checkbox"
                        checked={field.value}
                        disabled={field.disabled}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <IsOverridden
                      userConfig={config}
                      name="save.format_on_save"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="formatting.line_length"
                render={({ field }) => (
                  <div className="flex flex-col space-y-1">
                    <FormItem className={formItemClasses}>
                      <FormLabel>行长度</FormLabel>
                      <FormControl>
                        <NumberField
                          aria-label="行长度"
                          data-testid="line-length-input"
                          className="m-0 w-24"
                          {...field}
                          value={field.value}
                          minValue={1}
                          maxValue={1000}
                          onChange={(value) => {
                            // Ignore NaN
                            field.onChange(value);
                            if (!Number.isNaN(value)) {
                              onSubmit(form.getValues());
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      <IsOverridden
                        userConfig={config}
                        name="formatting.line_length"
                      />
                    </FormItem>

                    <FormDescription>
                      格式化代码时的最大行长度。
                    </FormDescription>
                  </div>
                )}
              />
            </SettingGroup>
            <SettingGroup title="自动补全">
              <FormField
                control={form.control}
                name="completion.activate_on_typing"
                render={({ field }) => (
                  <div className="flex flex-col space-y-1">
                    <FormItem className={formItemClasses}>
                      <FormLabel className="font-normal">
                        自动补全
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          data-testid="autocomplete-checkbox"
                          checked={field.value}
                          disabled={field.disabled}
                          onCheckedChange={(checked) => {
                            field.onChange(Boolean(checked));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      <IsOverridden
                        userConfig={config}
                        name="completion.activate_on_typing"
                      />
                    </FormItem>
                    <FormDescription>
                      取消勾选后，仍可通过快捷键使用代码补全。
                    </FormDescription>

                    <div>
                      <Button
                        variant="link"
                        className="mb-0 px-0"
                        type="button"
                        onClick={(evt) => {
                          evt.preventDefault();
                          evt.stopPropagation();
                          setActiveCategory("ai");
                        }}
                      >
                        编辑 AI 自动补全
                      </Button>
                    </div>
                  </div>
                )}
              />
              <div className="flex flex-col space-y-1">
                <FormItem className={formItemClasses}>
                  <FormLabel className="font-normal">
                    Accept suggestion on Enter
                  </FormLabel>
                  <FormControl>
                    <Checkbox
                      data-testid="accept-completion-on-enter-checkbox"
                      checked={acceptOnEnter}
                      onCheckedChange={(checked) =>
                        setAcceptOnEnter(Boolean(checked))
                      }
                    />
                  </FormControl>
                </FormItem>
                <FormDescription>
                  When unchecked, pressing Enter inserts a new line instead of
                  accepting an autocomplete suggestion. Use Tab to accept
                  suggestions.
                </FormDescription>
              </div>
              <FormField
                control={form.control}
                name="completion.signature_hint_on_typing"
                render={({ field }) => (
                  <div className="flex flex-col space-y-1">
                    <FormItem className={formItemClasses}>
                      <FormLabel className="font-normal">
                        参数提示
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          data-testid="signature-hint-on-type-checkbox"
                          checked={field.value ?? false}
                          disabled={field.disabled}
                          onCheckedChange={(checked) => {
                            field.onChange(Boolean(checked));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      <IsOverridden
                        userConfig={config}
                        name="completion.signature_hint_on_typing"
                      />
                    </FormItem>
                    <FormDescription>
                      在函数调用中输入时显示参数提示。
                    </FormDescription>
                  </div>
                )}
              />
            </SettingGroup>
            <SettingGroup title="语言服务器">
              <FormDescription>
                查看{" "}
                <ExternalLink href="https://docs.marimo.io/guides/editor_features/language_server/">
                  文档
                </ExternalLink>{" "}
                了解语言服务器支持的更多信息。
              </FormDescription>
              <FormDescription>
                <strong>注意：</strong>同时使用多个语言服务器时，不同功能可能会冲突。
              </FormDescription>

              <FormField
                control={form.control}
                name="language_servers.pylsp.enabled"
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <FormItem className={formItemClasses}>
                      <FormLabel>
                        <Badge variant="defaultOutline" className="mr-2">
                           测试版
                        </Badge>
                         Python 语言服务器 (
                         <ExternalLink href="https://github.com/python-lsp/python-lsp-server">
                           文档
                         </ExternalLink>
                         )
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          data-testid="pylsp-checkbox"
                          checked={field.value}
                          disabled={field.disabled}
                          onCheckedChange={(checked) => {
                            field.onChange(Boolean(checked));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      <IsOverridden
                        userConfig={config}
                        name="language_servers.pylsp.enabled"
                      />
                    </FormItem>
                    {field.value && !capabilities.pylsp && (
                      <Banner kind="danger">
                        当前环境中没有可用的 Python 语言服务器。请安装{" "}
                        <Kbd className="inline">python-lsp-server</Kbd> in your
                        环境中。
                      </Banner>
                    )}
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="language_servers.basedpyright.enabled"
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <FormItem className={formItemClasses}>
                      <FormLabel>
                        <Badge variant="defaultOutline" className="mr-2">
                           测试版
                        </Badge>
                        basedpyright (
                         <ExternalLink href="https://github.com/DetachHead/basedpyright">
                           文档
                         </ExternalLink>
                         )
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          data-testid="basedpyright-checkbox"
                          checked={field.value}
                          disabled={field.disabled}
                          onCheckedChange={(checked) => {
                            field.onChange(Boolean(checked));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      <IsOverridden
                        userConfig={config}
                        name="language_servers.basedpyright.enabled"
                      />
                    </FormItem>
                    {field.value && !capabilities.basedpyright && (
                      <Banner kind="danger">
                        当前环境中没有可用的 basedpyright。请安装{" "}
                        <Kbd className="inline">basedpyright</Kbd> in your
                        环境中。
                      </Banner>
                    )}
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="language_servers.pyrefly.enabled"
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <FormItem className={formItemClasses}>
                      <FormLabel>
                        <Badge variant="defaultOutline" className="mr-2">
                           测试版
                        </Badge>
                        Pyrefly (
                         <ExternalLink href="https://github.com/facebook/pyrefly">
                           文档
                         </ExternalLink>
                         )
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          data-testid="pyrefly-checkbox"
                          checked={field.value}
                          disabled={field.disabled}
                          onCheckedChange={(checked) => {
                            field.onChange(Boolean(checked));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      <IsOverridden
                        userConfig={config}
                        name="language_servers.pyrefly.enabled"
                      />
                    </FormItem>
                    {field.value && !capabilities.pyrefly && (
                      <Banner kind="danger">
                        当前环境中没有可用的 Pyrefly。请安装 <Kbd className="inline">pyrefly</Kbd>。
                      </Banner>
                    )}
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="language_servers.ty.enabled"
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <FormItem className={formItemClasses}>
                      <FormLabel>
                        <Badge variant="defaultOutline" className="mr-2">
                           测试版
                        </Badge>
                        ty (
                         <ExternalLink href="https://github.com/astral-sh/ty">
                           文档
                         </ExternalLink>
                         )
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          data-testid="ty-checkbox"
                          checked={field.value}
                          disabled={field.disabled}
                          onCheckedChange={(checked) => {
                            field.onChange(Boolean(checked));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      <IsOverridden
                        userConfig={config}
                        name="language_servers.ty.enabled"
                      />
                    </FormItem>
                    {field.value && !capabilities.ty && (
                      <Banner kind="danger">
                        当前环境中没有可用的 ty。请安装 <Kbd className="inline">ty</Kbd>。
                      </Banner>
                    )}
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="diagnostics.enabled"
                render={({ field }) => (
                  <FormItem className={formItemClasses}>
                    <FormLabel>
                      <Badge variant="defaultOutline" className="mr-2">
                       测试版
                      </Badge>
                       诊断
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        data-testid="diagnostics-checkbox"
                        checked={field.value}
                        disabled={field.disabled}
                        onCheckedChange={(checked) => {
                          field.onChange(Boolean(checked));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <IsOverridden
                      userConfig={config}
                      name="diagnostics.enabled"
                    />
                  </FormItem>
                )}
              />
            </SettingGroup>

            <SettingGroup title="键位方案">
              <FormField
                control={form.control}
                name="keymap.preset"
                render={({ field }) => (
                  <div className="flex flex-col space-y-1">
                    <FormItem className={formItemClasses}>
                       <FormLabel>键位方案</FormLabel>
                      <FormControl>
                        <NativeSelect
                          data-testid="keymap-select"
                          onChange={(e) => field.onChange(e.target.value)}
                          value={field.value}
                          disabled={field.disabled}
                          className="inline-flex mr-2"
                        >
                          {KEYMAP_PRESETS.map((option) => (
                            <option value={option} key={option}>
                              {option}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                      <IsOverridden userConfig={config} name="keymap.preset" />
                    </FormItem>
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="keymap.destructive_delete"
                render={({ field }) => (
                  <div className="flex flex-col space-y-1">
                    <FormItem className={formItemClasses}>
                      <FormLabel className="font-normal">
                         破坏性删除
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          data-testid="destructive-delete-checkbox"
                          checked={field.value}
                          disabled={field.disabled}
                          onCheckedChange={(checked) => {
                            field.onChange(Boolean(checked));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      <IsOverridden
                        userConfig={config}
                        name="keymap.destructive_delete"
                      />
                    </FormItem>
                    <FormDescription className="flex items-center gap-1">
                      允许删除非空单元格
                      <Tooltip
                        content={
                          <div className="max-w-xs">
                            <strong>请谨慎使用：</strong>删除含代码的单元格可能会丢失工作和计算结果，因为变量会从内存中移除。
                          </div>
                        }
                      >
                        <AlertTriangleIcon className="w-3 h-3 text-(--amber-11)" />
                      </Tooltip>
                    </FormDescription>

                    <div>
                      <Button
                        variant="link"
                        className="mb-0 px-0"
                        type="button"
                        onClick={(evt) => {
                          evt.preventDefault();
                          evt.stopPropagation();
                          setKeyboardShortcutsOpen(true);
                        }}
                      >
                        编辑键盘快捷键
                      </Button>
                    </div>
                  </div>
                )}
              />
            </SettingGroup>
          </>
        );
      case "display":
        return (
          <>
            <SettingGroup title="显示">
              <FormField
                control={form.control}
                name="display.default_width"
                render={({ field }) => (
                  <div className="flex flex-col space-y-1">
                    <FormItem className={formItemClasses}>
                      <FormLabel>默认宽度</FormLabel>
                      <FormControl>
                        <NativeSelect
                          data-testid="user-config-width-select"
                          onChange={(e) => field.onChange(e.target.value)}
                          value={field.value}
                          disabled={field.disabled}
                          className="inline-flex mr-2"
                        >
                          {getAppWidths().map((option) => (
                            <option value={option} key={option}>
                              {option}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                      <IsOverridden
                        userConfig={config}
                        name="display.default_width"
                      />
                    </FormItem>

                    <FormDescription>
                       新 notebook 的默认应用宽度；可被应用配置中的 "width" 覆盖。
                    </FormDescription>
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="display.theme"
                render={({ field }) => (
                  <div className="flex flex-col space-y-1">
                    <FormItem className={formItemClasses}>
                       <FormLabel>主题</FormLabel>
                      <FormControl>
                        <NativeSelect
                          data-testid="theme-select"
                          onChange={(e) => field.onChange(e.target.value)}
                          value={field.value}
                          disabled={field.disabled}
                          className="inline-flex mr-2"
                        >
                          {THEMES.map((option) => (
                            <option value={option} key={option}>
                              {option}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                      <IsOverridden userConfig={config} name="display.theme" />
                    </FormItem>

                    <FormDescription>
                       此主题会应用到用户配置中；共享 notebook 时不会影响主题。
                    </FormDescription>
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="display.code_editor_font_size"
                render={({ field }) => (
                  <FormItem className={formItemClasses}>
                     <FormLabel>代码编辑器字体大小（px）</FormLabel>
                    <FormControl>
                      <span className="inline-flex mr-2">
                        <NumberField
                          aria-label="代码编辑器字体大小"
                          data-testid="code-editor-font-size-input"
                          className="m-0 w-24"
                          {...field}
                          value={field.value}
                          minValue={8}
                          maxValue={32}
                          onChange={(value) => {
                            field.onChange(value);
                            onSubmit(form.getValues());
                          }}
                        />
                      </span>
                    </FormControl>
                    <FormMessage />
                    <IsOverridden
                      userConfig={config}
                      name="display.code_editor_font_size"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="display.locale"
                render={({ field }) => (
                  <div className="flex flex-col space-y-1">
                    <FormItem className={formItemClasses}>
                       <FormLabel>区域设置</FormLabel>
                      <FormControl>
                        <NativeSelect
                          data-testid="locale-select"
                          onChange={(e) => {
                            if (e.target.value === LOCALE_SYSTEM_VALUE) {
                              field.onChange(undefined);
                            } else {
                              field.onChange(e.target.value);
                            }
                          }}
                          value={field.value || LOCALE_SYSTEM_VALUE}
                          disabled={field.disabled}
                          className="inline-flex mr-2"
                        >
                           <option value={LOCALE_SYSTEM_VALUE}>系统</option>
                          {navigator.languages.map((option) => (
                            <option value={option} key={option}>
                              {option}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                      <IsOverridden userConfig={config} name="display.locale" />
                    </FormItem>

                    <FormDescription>
                       notebook 使用的区域设置。如果列表中没有你想要的区域设置，可以通过{" "}
                       <Kbd className="inline">marimo config show</Kbd>.
                    </FormDescription>
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="display.reference_highlighting"
                render={({ field }) => (
                  <div className="flex flex-col space-y-1">
                    <FormItem className={formItemClasses}>
                       <FormLabel>引用高亮</FormLabel>
                      <FormControl>
                        <Checkbox
                          data-testid="reference-highlighting-checkbox"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                      <IsOverridden
                        userConfig={config}
                        name="display.reference_highlighting"
                      />
                    </FormItem>

                    <FormDescription>
                       视觉上强调单元格中那些在 notebook 其他位置定义的变量。
                    </FormDescription>
                  </div>
                )}
              />
            </SettingGroup>
            <SettingGroup title="输出">
              <FormField
                control={form.control}
                name="display.cell_output"
                render={({ field }) => (
                  <div className="flex flex-col space-y-1">
                    <FormItem className={formItemClasses}>
                      <FormLabel>单元格输出区域</FormLabel>
                      <FormControl>
                        <NativeSelect
                          data-testid="cell-output-select"
                          onChange={(e) => field.onChange(e.target.value)}
                          value={field.value}
                          disabled={field.disabled}
                          className="inline-flex mr-2"
                        >
                          {["above", "below"].map((option) => (
                            <option value={option} key={option}>
                              {option}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                      <IsOverridden
                        userConfig={config}
                        name="display.cell_output"
                      />
                    </FormItem>

                    <FormDescription>
                       单元格输出显示在何处。
                    </FormDescription>
                  </div>
                )}
              />
            </SettingGroup>
          </>
        );
      case "packageManagementAndData":
        return (
          <>
            <SettingGroup title="包管理">
              <FormField
                control={form.control}
                disabled={isWasmRuntime}
                name="package_management.manager"
                render={({ field }) => (
                  <div className="flex flex-col space-y-1">
                    <FormItem className={formItemClasses}>
                       <FormLabel>管理器</FormLabel>
                      <FormControl>
                        <NativeSelect
                          data-testid="package-manager-select"
                          onChange={(e) => field.onChange(e.target.value)}
                          value={field.value}
                          disabled={field.disabled}
                          className="inline-flex mr-2"
                        >
                          {PackageManagerNames.map((option) => (
                            <option value={option} key={option}>
                              {option}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                      <IsOverridden
                        userConfig={config}
                        name="package_management.manager"
                      />
                    </FormItem>

                    <FormDescription>
                       当 marimo 遇到未安装的模块时，会提示你使用偏好的包管理器安装它。了解更多请查看{" "}
                        <ExternalLink href="https://docs.marimo.io/guides/editor_features/package_management.html">
                         文档
                        </ExternalLink>
                      .
                      <br />
                      <br />
                      在{" "}
                      <ExternalLink href="https://docs.marimo.io/guides/package_management/inlining_dependencies.html">
                        沙盒环境
                      </ExternalLink>{" "}
                      中运行 marimo 仅由 <Kbd className="inline">uv</Kbd> 支持
                    </FormDescription>
                  </div>
                )}
              />
            </SettingGroup>
            <SettingGroup title="数据">
              <DataForm form={form} config={config} onSubmit={onSubmit} />
            </SettingGroup>
          </>
        );
      case "runtime":
        return (
            <SettingGroup title="运行时配置">
            <FormField
              control={form.control}
              name="runtime.auto_instantiate"
              render={({ field }) => (
                <div className="flex flex-col gap-y-1">
                  <FormItem className={formItemClasses}>
                    <FormLabel className="font-normal">
                       启动时自动运行
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        data-testid="auto-instantiate-checkbox"
                        disabled={field.disabled}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                    <IsOverridden
                      userConfig={config}
                      name="runtime.auto_instantiate"
                    />
                  </FormItem>

                  <FormDescription>
                     是否在启动时自动运行所有单元格。
                  </FormDescription>
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="runtime.on_cell_change"
              render={({ field }) => (
                <div className="flex flex-col gap-y-1">
                  <FormItem className={formItemClasses}>
                    <FormLabel className="font-normal">
                       单元格变更时
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        data-testid="on-cell-change-select"
                        onChange={(e) => field.onChange(e.target.value)}
                        value={field.value}
                        className="inline-flex mr-2"
                      >
                        {["lazy", "autorun"].map((option) => (
                          <option value={option} key={option}>
                            {option}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                    <IsOverridden
                      userConfig={config}
                      name="runtime.on_cell_change"
                    />
                  </FormItem>
                  <FormDescription>
                     是否让 marimo 自动运行单元格，还是仅将它们标记为过期。若为 "autorun"，当某个单元格运行或与 UI 元素交互时，marimo 会自动运行受影响的单元格；若为 "lazy"，marimo 会标记受影响的单元格为过期，但不会重新运行它们。
                  </FormDescription>
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="runtime.auto_reload"
              render={({ field }) => (
                <div className="flex flex-col gap-y-1">
                  <FormItem className={formItemClasses}>
                    <FormLabel className="font-normal">
                       模块变更时
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        data-testid="auto-reload-select"
                        onChange={(e) => field.onChange(e.target.value)}
                        value={field.value}
                        disabled={isWasmRuntime}
                        className="inline-flex mr-2"
                      >
                        {["off", "lazy", "autorun"].map((option) => (
                          <option value={option} key={option}>
                            {option}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                    <IsOverridden
                      userConfig={config}
                      name="runtime.auto_reload"
                    />
                  </FormItem>
                  <FormDescription>
                     是否在执行单元格前自动重新加载模块。若为 "lazy"，marimo 会将受模块修改影响的单元格标记为过期；若为 "autorun"，受影响的单元格会自动重新运行。
                  </FormDescription>
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="runtime.reactive_tests"
              render={({ field }) => (
                <div className="flex flex-col gap-y-1">
                  <FormItem className={formItemClasses}>
                    <FormLabel className="font-normal">
                       自动运行单元测试
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        data-testid="reactive-test-checkbox"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                  <IsOverridden
                    userConfig={config}
                    name="runtime.reactive_tests"
                  />
                  <FormMessage />
                  <FormDescription>
                   在 notebook 中启用响应式 pytest 测试。当某个单元格只包含测试函数（test_*）和类（Test_*）时，marimo 会自动使用 pytest 运行它们（需要重启 notebook）。
                  </FormDescription>{" "}
                </div>
              )}
            />

            <FormDescription>
              了解更多请查看{" "}
              <ExternalLink href="https://docs.marimo.io/guides/reactivity/#configuring-how-marimo-runs-cells">
                文档
              </ExternalLink>
              .
            </FormDescription>
          </SettingGroup>
        );
      case "ai":
        return <AiConfig form={form} config={config} onSubmit={onSubmit} />;
      case "optionalDeps":
        return <OptionalFeatures />;
      case "labs":
        return (
            <SettingGroup title="实验功能">
            <p className="text-sm text-muted-secondary mb-4">
              ⚠️ 这些功能为实验性功能，可能需要重启 notebook 才会生效。
            </p>

            <FormField
              control={form.control}
              name="experimental.rtc_v2"
              render={({ field }) => (
                <div className="flex flex-col gap-y-1">
                  <FormItem className={formItemClasses}>
                    <FormLabel className="font-normal">
                       实时协作
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        data-testid="rtc-checkbox"
                        checked={field.value === true}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>

                  <FormDescription>
                     启用实验性的实时协作。此更改需要刷新页面后才会生效。
                  </FormDescription>
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="experimental.external_agents"
              render={({ field }) => (
                <div className="flex flex-col gap-y-1">
                  <FormItem className={formItemClasses}>
                    <FormLabel className="font-normal">
                       外部代理
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        data-testid="external-agents-checkbox"
                        checked={field.value === true}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                  <IsOverridden
                    userConfig={config}
                    name="experimental.external_agents"
                  />
                  <FormDescription>
                   启用实验性的外部代理，例如 Claude Code 和 Gemini CLI。了解更多请查看{" "}
                   <ExternalLink href="https://docs.marimo.io/guides/editor_features/agents/">
                     文档
                   </ExternalLink>
                    .
                  </FormDescription>
                </div>
              )}
            />
          </SettingGroup>
        );
    }
  };

  const configMessage = (
    <p className="text-muted-secondary">
       用户配置存储在 <Kbd className="inline">marimo.toml</Kbd> 中
      <br />
       在终端中运行 <Kbd className="inline">marimo config show</Kbd>，即可查看当前配置和文件位置。
    </p>
  );

  return (
    <Form {...form}>
      <form
        ref={formElement}
        onChange={form.handleSubmit(onSubmit)}
        className="flex text-pretty overflow-hidden"
      >
        <Tabs
          value={activeCategory}
          onValueChange={(value) =>
            setActiveCategory(value as SettingCategoryId)
          }
          orientation="vertical"
          className="w-1/3 border-r h-full overflow-auto p-3"
        >
          <TabsList className="self-start max-h-none flex flex-col gap-2 shrink-0 bg-background flex-1 min-h-full">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="w-full text-left p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground justify-start"
              >
                <div className="flex gap-4 items-center text-lg overflow-hidden">
                  <span
                    className={cn(
                      category.className,
                      "w-8 h-8 rounded flex items-center justify-center text-muted-foreground shrink-0",
                    )}
                  >
                    <category.Icon className="w-4 h-4" />
                  </span>
                  <span className="truncate">{category.label}</span>
                </div>
              </TabsTrigger>
            ))}

            <div className="p-2 text-xs text-muted-foreground self-start flex flex-col gap-1">
              <span>版本：{marimoVersion}</span>
              <span>区域设置：{locale}</span>
            </div>

            <div className="flex-1" />
            {!isWasm() && configMessage}
          </TabsList>
        </Tabs>
        <div className="w-2/3 pl-6 gap-2 flex flex-col overflow-auto p-6">
          {renderBody()}
        </div>
      </form>
    </Form>
  );
};
