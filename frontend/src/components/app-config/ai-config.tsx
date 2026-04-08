/* Copyright 2026 Marimo. All rights reserved. */

import { useAtom } from "jotai";
import {
  BotIcon,
  BrainIcon,
  ChevronRightIcon,
  InfoIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import React, { useId, useMemo, useState } from "react";
import {
  Button as AriaButton,
  Tree,
  TreeItem,
  TreeItemContent,
} from "react-aria-components";
import type { FieldPath, UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import useEvent from "react-use-event-hook";
import {
  FormControl,
  FormDescription,
  FormErrorsBanner,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { SupportedRole } from "@/core/ai/config";
import {
  AiModelId,
  KNOWN_PROVIDERS,
  type KnownProviderId,
  type ProviderId,
  type QualifiedModelId,
  type ShortModelId,
} from "@/core/ai/ids/ids";
import { type AiModel, AiModelRegistry } from "@/core/ai/model-registry";
import { CopilotConfig } from "@/core/codemirror/copilot/copilot-config";
import { DEFAULT_AI_MODEL, type UserConfig } from "@/core/config/config-schema";
import { isWasm } from "@/core/wasm/utils";
import { cn } from "@/utils/cn";
import { Events } from "@/utils/events";
import { Strings } from "@/utils/strings";
import { AIModelDropdown, getProviderLabel } from "../ai/ai-model-dropdown";
import {
  AiProviderIcon,
  type AiProviderIconProps,
} from "../ai/ai-provider-icon";
import { getTagColour } from "../ai/display-helpers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { ExternalLink } from "../ui/links";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Tooltip } from "../ui/tooltip";
import { formItemClasses, SettingSubtitle } from "./common";
import { AWS_REGIONS } from "./constants";
import { IncorrectModelId } from "./incorrect-model-id";
import { IsOverridden } from "./is-overridden";
import { MCPConfig } from "./mcp-config";
import { aiSettingsSubTabAtom } from "./state";

interface AiConfigProps {
  form: UseFormReturn<UserConfig>;
  config: UserConfig;
  onSubmit: (values: UserConfig) => void;
}

interface AiProviderTitleProps {
  provider?: AiProviderIconProps["provider"];
  children: React.ReactNode;
}

interface CustomProviderConfig {
  api_key?: string;
  base_url?: string;
}

export const AiProviderTitle: React.FC<AiProviderTitleProps> = ({
  provider,
  children,
}) => {
  return (
    <div className="flex items-center text-base font-semibold">
      {provider && <AiProviderIcon provider={provider} className="mr-2" />}
      {children}
    </div>
  );
};

interface ApiKeyProps {
  form: UseFormReturn<UserConfig>;
  config: UserConfig;
  name: FieldPath<UserConfig>;
  placeholder: string;
  testId: string;
  description?: React.ReactNode;
  onChange?: (value: string) => void;
}

export const ApiKey: React.FC<ApiKeyProps> = ({
  form,
  config,
  name,
  placeholder,
  testId,
  description,
  onChange,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col space-y-1">
          <FormItem className={formItemClasses}>
            <FormLabel>API Key</FormLabel>
            <FormControl>
              <Input
                data-testid={testId}
                rootClassName="flex-1"
                className="m-0 inline-flex h-7"
                placeholder={placeholder}
                type="password"
                {...field}
                value={asStringOrEmpty(field.value)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value.includes("*")) {
                    field.onChange(value);
                    onChange?.(value);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
            <IsOverridden userConfig={config} name={name} />
          </FormItem>
          {description && <FormDescription>{description}</FormDescription>}
        </div>
      )}
    />
  );
};

interface BaseUrlProps {
  form: UseFormReturn<UserConfig>;
  config: UserConfig;
  name: FieldPath<UserConfig>;
  placeholder: string;
  testId: string;
  description?: React.ReactNode;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

function asStringOrEmpty<T>(value: T): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return String(value);
}

export const BaseUrl: React.FC<BaseUrlProps> = ({
  form,
  config,
  name,
  placeholder,
  testId,
  description,
  disabled = false,
  onChange,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col space-y-1">
            <FormItem className={formItemClasses}>
            <FormLabel>基础 URL</FormLabel>
            <FormControl>
              <Input
                data-testid={testId}
                rootClassName="flex-1"
                className="m-0 inline-flex h-7"
                placeholder={placeholder}
                {...field}
                value={asStringOrEmpty(field.value)}
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  onChange?.(e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
            <IsOverridden userConfig={config} name={name} />
          </FormItem>
          {description && <FormDescription>{description}</FormDescription>}
        </div>
      )}
    />
  );
};

interface ModelSelectorProps {
  form: UseFormReturn<UserConfig>;
  config: UserConfig;
  name: FieldPath<UserConfig>;
  placeholder: string;
  description?: React.ReactNode;
  label: string;
  forRole: SupportedRole;
  onSubmit: (values: UserConfig) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  form,
  config,
  name,
  placeholder,
  description,
  label,
  forRole,
  onSubmit,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const value = asStringOrEmpty(field.value);

        const selectModel = (modelId: QualifiedModelId) => {
          field.onChange(modelId);
          // Usually not needed, but a hack to force form values to be updated
          onSubmit(form.getValues());
        };

        const renderFormItem = () => (
          <FormItem className={formItemClasses}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <AIModelDropdown
                value={value}
                placeholder={placeholder}
                onSelect={selectModel}
                triggerClassName="text-sm"
                customDropdownContent={
                  <>
                    <DropdownMenuSeparator />
                    <p className="px-2 py-1.5 text-sm text-muted-secondary flex items-center gap-1">
                      输入自定义模型
                      <Tooltip content="模型应包含提供方前缀，例如 'openai/gpt-4o'">
                        <InfoIcon className="h-3 w-3" />
                      </Tooltip>
                    </p>
                    <div className="px-2 py-1">
                      <Input
                        className="w-full border-border shadow-none focus-visible:shadow-xs"
                        placeholder={placeholder}
                        {...field}
                        value={asStringOrEmpty(field.value)}
                        onKeyDown={Events.stopPropagation()}
                      />
                      {value && (
                        <IncorrectModelId
                          value={value}
                          includeSuggestion={false}
                        />
                      )}
                    </div>
                  </>
                }
                forRole={forRole}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );

        return (
          <div className="flex flex-col space-y-1">
            {renderFormItem()}
            <IsOverridden userConfig={config} name={name} />
            <IncorrectModelId value={value} />
            {description && <FormDescription>{description}</FormDescription>}
          </div>
        );
      }}
    />
  );
};

interface ProviderSelectProps {
  form: UseFormReturn<UserConfig>;
  config: UserConfig;
  name: FieldPath<UserConfig>;
  options: string[];
  testId: string;
  disabled?: boolean;
}

export const ProviderSelect: React.FC<ProviderSelectProps> = ({
  form,
  config,
  name,
  options,
  testId,
  disabled = false,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col space-y-1">
          <FormItem className={formItemClasses}>
            <FormLabel>提供方</FormLabel>
            <FormControl>
              <NativeSelect
                data-testid={testId}
                onChange={(e) => {
                  if (e.target.value === "none") {
                    field.onChange(false);
                  } else {
                    field.onChange(e.target.value);
                  }
                }}
                value={asStringOrEmpty(
                  field.value === true
                    ? "github"
                    : field.value === false
                      ? "none"
                      : field.value,
                )}
                disabled={disabled}
                className="inline-flex mr-2"
              >
                {options.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </NativeSelect>
            </FormControl>
            <FormMessage />
            <IsOverridden userConfig={config} name={name} />
          </FormItem>
        </div>
      )}
    />
  );
};

const renderCopilotProvider = ({
  form,
  config,
  onSubmit,
}: {
  form: UseFormReturn<UserConfig>;
  config: UserConfig;
  onSubmit: (values: UserConfig) => void;
}) => {
  const copilot = form.getValues("completion.copilot");
  if (copilot === false) {
    return null;
  }

  if (copilot === "codeium") {
    return (
      <>
          <p className="text-sm text-muted-secondary">
            要获取 Windsurf API 密钥，请查看{" "}
            <ExternalLink href="https://docs.marimo.io/guides/editor_features/ai_completion.html#windsurf-copilot">
              这些说明
            </ExternalLink>
            。
          </p>
        <ApiKey
          form={form}
          config={config}
          name="completion.codeium_api_key"
          placeholder="key"
          testId="codeium-api-key-input"
        />
      </>
    );
  }

  if (copilot === "github") {
    return <CopilotConfig />;
  }

  if (copilot === "custom") {
    return (
      <ModelSelector
        label="自动补全模型"
        form={form}
        config={config}
        name="ai.models.autocomplete_model"
        placeholder="ollama/qwen2.5-coder:1.5b"
        description="使用自定义提供方时用于代码补全的模型。"
        onSubmit={onSubmit}
        forRole="autocomplete"
      />
    );
  }
};

const SettingGroup = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col gap-4 pb-4", className)}>{children}</div>
  );
};

interface ModelListItemProps {
  qualifiedId: QualifiedModelId;
  model: AiModel;
  isEnabled: boolean;
  onToggle: (modelId: QualifiedModelId) => void;
  onDelete: (modelId: QualifiedModelId) => void;
}

const ModelListItem: React.FC<ModelListItemProps> = ({
  qualifiedId,
  model,
  isEnabled,
  onToggle,
  onDelete,
}) => {
  const handleToggle = () => {
    onToggle(qualifiedId);
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(qualifiedId);
  };

  return (
    <TreeItem
      id={qualifiedId}
      textValue={model.name}
      className="pl-6 outline-none data-focused:bg-muted/50 hover:bg-muted/50"
      onAction={handleToggle}
    >
      <TreeItemContent>
        <div className="flex items-center justify-between px-3 py-2.5 border-b last:border-b-0 cursor-pointer outline-none">
          <ModelInfoCard model={model} />
          {model.custom && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="mr-2 hover:bg-transparent"
            >
              <Trash2Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
          <Switch checked={isEnabled} onClick={handleToggle} size="sm" />
        </div>
      </TreeItemContent>
    </TreeItem>
  );
};

const ModelInfoCard = ({ model }: { model: AiModel }) => {
  return (
    <div className="flex flex-col flex-1 gap-0.5">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-sm">{model.name}</h3>
          <Tooltip content="自定义模型">
          {model.custom && <BotIcon className="h-4 w-4" />}
        </Tooltip>
        {model.thinking && (
          <div
            className={cn(
              "flex items-center gap-1 rounded px-1 py-0.5 w-fit",
              getTagColour("thinking"),
            )}
          >
            <BrainIcon className="h-3 w-3" />
            <span className="text-xs font-medium">推理</span>
          </div>
        )}
      </div>
      {model.description && !model.custom && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {model.description}
        </p>
      )}
    </div>
  );
};

export const AiCodeCompletionConfig: React.FC<AiConfigProps> = ({
  form,
  config,
  onSubmit,
}) => {
  return (
    <SettingGroup>
      <SettingSubtitle>代码补全</SettingSubtitle>
      <p className="text-sm text-muted-secondary">
        选择 GitHub Copilot、Codeium，或自定义提供方（例如 Ollama），即可启用 AI 驱动的代码补全。
      </p>

      <ProviderSelect
        form={form}
        config={config}
        name="completion.copilot"
        options={["none", "github", "codeium", "custom"]}
        testId="copilot-select"
      />

      {renderCopilotProvider({ form, config, onSubmit })}
    </SettingGroup>
  );
};

const AccordionFormItem = ({
  title,
  triggerClassName,
  provider,
  children,
  isConfigured,
  value,
}: {
  title: string;
  triggerClassName?: string;
  provider: AiProviderIconProps["provider"];
  children: React.ReactNode;
  isConfigured: boolean;
  /** Custom value for the accordion item. Defaults to provider. */
  value?: string;
}) => {
  return (
    <AccordionItem value={value ?? provider}>
      <AccordionTrigger className={triggerClassName}>
        <AiProviderTitle provider={provider}>
          {title}
          {isConfigured && (
            <span className="ml-2 px-1 rounded bg-muted text-xs font-medium border">
              已配置
            </span>
          )}
        </AiProviderTitle>
      </AccordionTrigger>
      <AccordionContent wrapperClassName="flex flex-col gap-4">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export const CustomProvidersConfig: React.FC<AiConfigProps> = ({
  form,
  config,
  onSubmit,
}) => {
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [newProviderName, setNewProviderName] = useState("");
  const [newProviderApiKey, setNewProviderApiKey] = useState("");
  const [newProviderBaseUrl, setNewProviderBaseUrl] = useState("");

  const providerNameInputId = useId();
  const apiKeyInputId = useId();
  const baseUrlInputId = useId();

  const normalizedName = newProviderName.toLowerCase().replaceAll(/\s+/g, "_");
  const customProviders = form.watch("ai.custom_providers");
  const isDuplicate =
    KNOWN_PROVIDERS.includes(normalizedName as KnownProviderId) ||
    (customProviders && Object.keys(customProviders).includes(normalizedName));
  const hasInvalidChars = normalizedName.includes(".");

  const hasValidValues =
    normalizedName.trim() &&
    newProviderBaseUrl.trim() &&
    !isDuplicate &&
    !hasInvalidChars;

  const resetForm = () => {
    setNewProviderName("");
    setNewProviderApiKey("");
    setNewProviderBaseUrl("");
    setIsAddingProvider(false);
  };

  return (
    <FormField
      control={form.control}
      name="ai.custom_providers"
      render={({ field }) => {
        const customProviders = (field.value || {}) as Record<
          string,
          CustomProviderConfig
        >;
        const customProviderEntries = Object.entries(customProviders);

        const addProvider = () => {
          if (!hasValidValues) {
            return;
          }
          field.onChange({
            ...customProviders,
            [normalizedName]: {
              api_key: newProviderApiKey || undefined,
              base_url: newProviderBaseUrl,
            },
          });
          onSubmit(form.getValues());
          resetForm();
        };

        const removeProvider = (providerName: string) => {
          const { [providerName]: _, ...rest } = customProviders;
          // Reset to clear nested dirty state, then set new value
          form.resetField("ai.custom_providers");
          form.setValue("ai.custom_providers", rest, { shouldDirty: true });
          onSubmit(form.getValues());
        };

        const providerForm = (
          <div className="flex flex-col gap-3 p-4 border border-border rounded-md bg-muted/20">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={providerNameInputId}>提供方名称</Label>
              <Input
                id={providerNameInputId}
                placeholder="e.g., together, groq, mistral"
                value={newProviderName}
                onChange={(e) => setNewProviderName(e.target.value)}
              />
              {isDuplicate && (
                <p className="text-xs text-destructive">
                  已存在同名提供方。
                </p>
              )}
              {hasInvalidChars && (
                <p className="text-xs text-destructive">
                  提供方名称不能包含 "." 字符。
                </p>
              )}
              {newProviderName && !hasInvalidChars && (
                <p className="text-xs text-muted-secondary">
                  使用带前缀的模型：{" "}
                  <Kbd className="inline text-xs">{normalizedName}/</Kbd>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={baseUrlInputId}>
                基础 URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id={baseUrlInputId}
                placeholder="e.g., https://api.together.xyz/v1"
                value={newProviderBaseUrl}
                onChange={(e) => setNewProviderBaseUrl(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={apiKeyInputId}>API 密钥（可选）</Label>
              <Input
                id={apiKeyInputId}
                placeholder="sk-..."
                type="password"
                value={newProviderApiKey}
                onChange={(e) => setNewProviderApiKey(e.target.value)}
              />
            </div>

            <div className="flex gap-2 mt-1">
              <Button
                onClick={addProvider}
                disabled={!hasValidValues}
                size="xs"
              >
                添加提供方
              </Button>
              <Button variant="outline" onClick={resetForm} size="xs">
                取消
              </Button>
            </div>
          </div>
        );

        // Update a provider field by updating the entire custom_providers object.
        // As this config will be replaced, it needs to be sent in its entirety.
        const updateProviderField = (opts: {
          providerName: string;
          fieldName: keyof CustomProviderConfig;
          value: string;
        }) => {
          field.onChange({
            ...customProviders,
            [opts.providerName]: {
              ...customProviders[opts.providerName],
              [opts.fieldName]: opts.value || undefined,
            },
          });
        };

        const renderAccordionItem = ({
          providerName,
          providerConfig,
          onRemove,
        }: {
          providerName: string;
          providerConfig: CustomProviderConfig;
          onRemove: (name: string) => void;
        }) => {
          const displayName = Strings.startCase(providerName);
          const isConfigured =
            !!providerConfig.api_key || !!providerConfig.base_url;

          return (
            <AccordionFormItem
              key={`custom-${providerName}`}
              title={displayName}
              provider={providerName}
              value={`custom-${providerName}`}
              isConfigured={isConfigured}
            >
              <ApiKey
                form={form}
                config={config}
                name={
                  `ai.custom_providers.${providerName}.api_key` as FieldPath<UserConfig>
                }
                placeholder="sk-..."
                testId={`custom-provider-${providerName}-api-key`}
                onChange={(value) =>
                  updateProviderField({
                    providerName,
                    fieldName: "api_key",
                    value,
                  })
                }
              />
              <BaseUrl
                form={form}
                config={config}
                name={
                  `ai.custom_providers.${providerName}.base_url` as FieldPath<UserConfig>
                }
                placeholder="https://api.example.com/v1"
                testId={`custom-provider-${providerName}-base-url`}
                onChange={(value) =>
                  updateProviderField({
                    providerName,
                    fieldName: "base_url",
                    value,
                  })
                }
              />
              <Button
                variant="destructive"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onRemove(providerName);
                }}
                className="w-fit self-end"
              >
                <Trash2Icon className="h-4 w-4 mr-2" />
                Remove Provider
              </Button>
            </AccordionFormItem>
          );
        };

        return (
          <SettingGroup>
            <SettingSubtitle>自定义提供方</SettingSubtitle>
            <p className="text-sm text-muted-secondary">
              添加你自己的 OpenAI 兼容提供方。添加后，可以在 AI 模型选项卡中配置模型。
            </p>

            {customProviderEntries.length > 0 && (
              <Accordion type="multiple" className="-mt-4">
                {customProviderEntries.map(([name, providerConfig]) =>
                  renderAccordionItem({
                    providerName: name,
                    providerConfig,
                    onRemove: removeProvider,
                  }),
                )}
              </Accordion>
            )}

            {isAddingProvider ? (
              providerForm
            ) : (
              <AddButton
                className="self-start"
                isFormOpen={isAddingProvider}
                setIsFormOpen={setIsAddingProvider}
                label="添加提供方"
              />
            )}
          </SettingGroup>
        );
      }}
    />
  );
};

export const AiProvidersConfig: React.FC<AiConfigProps> = ({
  form,
  config,
  onSubmit,
}) => {
  const isWasmRuntime = isWasm();

  const hasValue = (name: FieldPath<UserConfig>) => {
    return !!form.getValues(name);
  };

  return (
    <SettingGroup>
      <p className="text-sm text-muted-secondary">
        在下方或 <Kbd className="inline">marimo.toml</Kbd> 中添加 API 密钥，以设置代码补全和助手功能的提供方；更多信息请查看{" "}
        <ExternalLink href="https://docs.marimo.io/guides/editor_features/ai_completion/#connecting-to-an-llm">
          文档
        </ExternalLink>
        。
      </p>
      <Accordion type="multiple">
        <AccordionFormItem
          title="OpenAI"
          provider="openai"
          triggerClassName="pt-0"
          isConfigured={hasValue("ai.open_ai.api_key")}
        >
          <ApiKey
            form={form}
            config={config}
            name="ai.open_ai.api_key"
            placeholder="sk-proj..."
            testId="ai-openai-api-key-input"
            description={
              <>
                你的 OpenAI API 密钥来自{" "}
                <ExternalLink href="https://platform.openai.com/account/api-keys">
                  platform.openai.com
                </ExternalLink>
                。
              </>
            }
          />
          <BaseUrl
            form={form}
            config={config}
            name="ai.open_ai.base_url"
            placeholder="https://api.openai.com/v1"
            testId="ai-base-url-input"
            disabled={isWasmRuntime}
          />
        </AccordionFormItem>

        <AccordionFormItem
          title="Anthropic"
          provider="anthropic"
          isConfigured={hasValue("ai.anthropic.api_key")}
        >
          <ApiKey
            form={form}
            config={config}
            name="ai.anthropic.api_key"
            placeholder="sk-ant..."
            testId="ai-anthropic-api-key-input"
            description={
              <>
                你的 Anthropic API 密钥来自{" "}
                <ExternalLink href="https://console.anthropic.com/settings/keys">
                  console.anthropic.com
                </ExternalLink>
                。
              </>
            }
          />
        </AccordionFormItem>

        <AccordionFormItem
          title="Google"
          provider="google"
          isConfigured={hasValue("ai.google.api_key")}
        >
          <ApiKey
            form={form}
            config={config}
            name="ai.google.api_key"
            placeholder="AI..."
            testId="ai-google-api-key-input"
            description={
              <>
                你的 Google AI API 密钥来自{" "}
                <ExternalLink href="https://aistudio.google.com/app/apikey">
                  aistudio.google.com
                </ExternalLink>
                。
              </>
            }
          />
        </AccordionFormItem>

        <AccordionFormItem
          title="Ollama"
          provider="ollama"
          isConfigured={hasValue("ai.ollama.base_url")}
        >
          <BaseUrl
            form={form}
            config={config}
            name="ai.ollama.base_url"
            placeholder="http://localhost:11434/v1"
            testId="ollama-base-url-input"
          />
        </AccordionFormItem>

        <AccordionFormItem
          title="GitHub"
          provider="github"
          isConfigured={hasValue("ai.github.api_key")}
        >
          <Alert variant="warning" className="py-1.5 px-3 text-xs">
              <AlertDescription>
                免费层模型的 token 限制较低，在较大的提示词下可能会出错。{" "}
                <ExternalLink href="https://docs.github.com/en/github-models/prototyping-with-ai-models#rate-limits">
                  了解更多
                </ExternalLink>
              </AlertDescription>
          </Alert>
          <ApiKey
            form={form}
            config={config}
            name="ai.github.api_key"
            placeholder="gho_..."
            testId="ai-github-api-key-input"
                description={
                  <>
                    你的 GitHub API 令牌来自{" "}
                    <Kbd className="inline">gh auth token</Kbd>。
                  </>
                }
          />
          <BaseUrl
            form={form}
            config={config}
            name="ai.github.base_url"
            placeholder="https://models.github.ai/inference"
            testId="ai-github-base-url-input"
          />
        </AccordionFormItem>

        <AccordionFormItem
          title="OpenRouter"
          provider="openrouter"
          isConfigured={hasValue("ai.openrouter.api_key")}
        >
          <ApiKey
            form={form}
            config={config}
            name="ai.openrouter.api_key"
            placeholder="or-..."
            testId="ai-openrouter-api-key-input"
                description={
                  <>
                    你的 OpenRouter API 密钥来自 {""}
                    <ExternalLink href="https://openrouter.ai/keys">
                      openrouter.ai
                    </ExternalLink>
                    。
                  </>
                }
          />
          <BaseUrl
            form={form}
            config={config}
            name="ai.openrouter.base_url"
            placeholder="https://openrouter.ai/api/v1/"
            testId="ai-openrouter-base-url-input"
          />
        </AccordionFormItem>

        <AccordionFormItem
          title="Weights & Biases"
          provider="wandb"
          isConfigured={hasValue("ai.wandb.api_key")}
        >
          <ApiKey
            form={form}
            config={config}
            name="ai.wandb.api_key"
            placeholder="your-wandb-api-key"
            testId="ai-wandb-api-key-input"
            description={
              <>
                你的 Weights & Biases API 密钥来自{" "}
                <ExternalLink href="https://wandb.ai/authorize">
                  wandb.ai
                </ExternalLink>
                。
              </>
            }
          />
          <BaseUrl
            form={form}
            config={config}
            name="ai.wandb.base_url"
            placeholder="https://api.inference.wandb.ai/v1/"
            testId="ai-wandb-base-url-input"
          />
        </AccordionFormItem>

        <AccordionFormItem
          title="Azure"
          provider="azure"
          isConfigured={
            hasValue("ai.azure.api_key") && hasValue("ai.azure.base_url")
          }
        >
          <ApiKey
            form={form}
            config={config}
            name="ai.azure.api_key"
            placeholder="sk-proj..."
            testId="ai-azure-api-key-input"
            description={
              <>
                你的 Azure API 密钥来自{" "}
                <ExternalLink href="https://portal.azure.com/">
                  portal.azure.com
                </ExternalLink>
                。
              </>
            }
          />
          <BaseUrl
            form={form}
            config={config}
            name="ai.azure.base_url"
            placeholder="https://<your-resource-name>.openai.azure.com/openai/deployments/<deployment-name>?api-version=<api-version>"
            testId="ai-azure-base-url-input"
          />
        </AccordionFormItem>

        <AccordionFormItem
          title="AWS Bedrock"
          provider="bedrock"
          isConfigured={hasValue("ai.bedrock.region_name")}
        >
          <p className="text-sm text-muted-secondary mb-2">
            要使用 AWS Bedrock，你需要配置 AWS 凭据和区域。更多细节请查看{" "}
            <ExternalLink href="https://docs.marimo.io/guides/editor_features/ai_completion.html#aws-bedrock">
              文档
            </ExternalLink>
            。
          </p>

          <FormField
            control={form.control}
            disabled={isWasmRuntime}
            name="ai.bedrock.region_name"
            render={({ field }) => (
              <div className="flex flex-col space-y-1">
                <FormItem className={formItemClasses}>
                  <FormLabel>AWS 区域</FormLabel>
                  <FormControl>
                    <NativeSelect
                      data-testid="bedrock-region-select"
                      onChange={(e) => field.onChange(e.target.value)}
                      value={
                        typeof field.value === "string"
                          ? field.value
                          : "us-east-1"
                      }
                      disabled={field.disabled}
                      className="inline-flex mr-2"
                    >
                      {AWS_REGIONS.map((option) => (
                        <option value={option} key={option}>
                          {option}
                        </option>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormMessage />
                  <IsOverridden
                    userConfig={config}
                    name="ai.bedrock.region_name"
                  />
                </FormItem>
                <FormDescription>
                  Bedrock 服务可用的 AWS 区域。
                </FormDescription>
              </div>
            )}
          />

          <FormField
            control={form.control}
            disabled={isWasmRuntime}
            name="ai.bedrock.profile_name"
            render={({ field }) => (
              <div className="flex flex-col space-y-1">
                <FormItem className={formItemClasses}>
                  <FormLabel>AWS 配置文件名称（可选）</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="bedrock-profile-input"
                      rootClassName="flex-1"
                      className="m-0 inline-flex h-7"
                      placeholder="default"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                  <IsOverridden
                    userConfig={config}
                    name="ai.bedrock.profile_name"
                  />
                </FormItem>
                <FormDescription>
                  你的 ~/.aws/credentials 文件中的 AWS 配置文件名称。留空则使用默认 AWS 凭据。
                </FormDescription>
              </div>
            )}
          />
        </AccordionFormItem>

        <AccordionFormItem
          title="OpenAI 兼容（旧版）"
          provider="openai-compatible"
          isConfigured={
            hasValue("ai.open_ai_compatible.api_key") &&
            hasValue("ai.open_ai_compatible.base_url")
          }
        >
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
            建议改用“自定义提供方”，这样可以添加多个不同名称的提供方。
          </p>
          <ApiKey
            form={form}
            config={config}
            name="ai.open_ai_compatible.api_key"
            placeholder="sk-..."
            testId="ai-openai-compatible-api-key-input"
            description={
              <>
                适用于任意 OpenAI 兼容提供方的 API 密钥（例如 Together、
                Groq、Mistral、Perplexity 等）。
              </>
            }
          />
          <BaseUrl
            form={form}
            config={config}
            name="ai.open_ai_compatible.base_url"
            placeholder="https://api.together.xyz/v1"
            testId="ai-openai-compatible-base-url-input"
                description={<>你的 OpenAI 兼容提供方的基础 URL。</>}
          />
        </AccordionFormItem>
      </Accordion>

      <CustomProvidersConfig form={form} config={config} onSubmit={onSubmit} />
    </SettingGroup>
  );
};

export const AiAssistConfig: React.FC<AiConfigProps> = ({
  form,
  config,
  onSubmit,
}) => {
  return (
    <SettingGroup>
      <SettingSubtitle>AI 助手</SettingSubtitle>

      <FormField
        control={form.control}
        name="ai.inline_tooltip"
        render={({ field }) => (
          <div className="flex flex-col gap-y-1">
            <FormItem className={formItemClasses}>
              <FormLabel className="font-normal">AI 编辑提示</FormLabel>
              <FormControl>
                <Checkbox
                  data-testid="inline-ai-checkbox"
                  checked={field.value === true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
              <FormDescription>
                选中代码时显示“使用 AI 编辑”的提示。
              </FormDescription>
          </div>
        )}
      />

      <FormErrorsBanner />
      <ModelSelector
        label="聊天模型"
        form={form}
        config={config}
        name="ai.models.chat_model"
        placeholder={DEFAULT_AI_MODEL}
        description={
          <span>用于聊天面板中对话的模型。</span>
        }
        forRole="chat"
        onSubmit={onSubmit}
      />
      <ModelSelector
        label="编辑模型"
        form={form}
        config={config}
        name="ai.models.edit_model"
        placeholder={DEFAULT_AI_MODEL}
        description={
          <span>
            用于通过{" "}
            <Kbd className="inline">使用 AI 生成</Kbd> 按钮进行代码编辑的模型。
          </span>
        }
        forRole="edit"
        onSubmit={onSubmit}
      />

      <FormField
        control={form.control}
        name="ai.rules"
        render={({ field }) => (
          <div className="flex flex-col">
            <FormItem>
              <FormLabel>自定义规则</FormLabel>
              <FormControl>
                <Textarea
                  data-testid="ai-rules-input"
                  className="m-0 inline-flex w-full h-32 p-2 text-sm"
                  placeholder="例如：始终使用类型标注；优先使用 polars 而不是 pandas"
                  {...field}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
              <IsOverridden userConfig={config} name="ai.rules" />
            </FormItem>
              <FormDescription>
              要包含在所有 AI 补全提示中的自定义规则。
            </FormDescription>
          </div>
        )}
      />
    </SettingGroup>
  );
};

interface ProviderTreeItemProps {
  providerId: ProviderId;
  models: AiModel[];
  enabledModels: Set<QualifiedModelId>;
  onToggleModel: (modelId: QualifiedModelId) => void;
  onToggleProvider: (providerId: ProviderId, enable: boolean) => void;
  onDeleteModel: (modelId: QualifiedModelId) => void;
}

const ProviderTreeItem: React.FC<ProviderTreeItemProps> = ({
  providerId,
  models,
  enabledModels,
  onToggleModel,
  onToggleProvider,
  onDeleteModel,
}) => {
  const enabledCount = models.filter((model) =>
    enabledModels.has(new AiModelId(providerId, model.model).id),
  ).length;
  const totalCount = models.length;
  const maybeProviderInfo = AiModelRegistry.getProviderInfo(providerId);
  const name = maybeProviderInfo?.name || Strings.startCase(providerId);

  const checkboxState =
    enabledCount === 0
      ? false
      : enabledCount === totalCount
        ? true
        : "indeterminate";

  const handleProviderToggle = useEvent(() => {
    const shouldEnable = enabledCount < totalCount / 2;
    onToggleProvider(providerId, shouldEnable);
  });

  return (
    <TreeItem
      id={providerId}
      hasChildItems={true}
      textValue={providerId}
      className="outline-none data-focused:bg-muted/50 group"
    >
      <TreeItemContent>
        <div className="flex items-center gap-3 px-2 py-3 hover:bg-muted/50 cursor-pointer outline-none focus-visible:outline-none border-b group-data-expanded:border-b-0 rounded-sm">
          <Checkbox
            checked={checkboxState}
            onCheckedChange={handleProviderToggle}
            onClick={Events.stopPropagation()}
          />
          <AiProviderIcon provider={providerId} className="h-5 w-5" />
          <div className="flex items-center justify-between w-full">
            <h2 className="font-semibold">{name}</h2>
            <p className="text-sm text-muted-secondary">
              {enabledCount}/{totalCount} 个模型
            </p>
          </div>
          <AriaButton slot="chevron">
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-expanded:rotate-90" />
          </AriaButton>
        </div>
      </TreeItemContent>

      {models.map((model) => {
        const qualifiedId = new AiModelId(providerId, model.model).id;
        return (
          <ModelListItem
            key={qualifiedId}
            qualifiedId={qualifiedId}
            model={model}
            isEnabled={enabledModels.has(qualifiedId)}
            onToggle={onToggleModel}
            onDelete={onDeleteModel}
          />
        );
      })}
    </TreeItem>
  );
};

export const AiModelDisplayConfig: React.FC<AiConfigProps> = ({
  form,
  onSubmit,
}) => {
  const customModels = useWatch({
    control: form.control,
    name: "ai.models.custom_models",
  }) as QualifiedModelId[];

  const customProviders = useWatch({
    control: form.control,
    name: "ai.custom_providers",
  }) as Record<string, CustomProviderConfig> | undefined;

  const customProviderNames = useMemo(
    () => Object.keys(customProviders || {}),
    [customProviders],
  );

  const aiModelRegistry = useMemo(
    () =>
      AiModelRegistry.create({
        displayedModels: [],
        customModels: customModels,
      }),
    [customModels],
  );
  const currentDisplayedModels = useWatch({
    control: form.control,
    name: "ai.models.displayed_models",
    defaultValue: [],
  }) as QualifiedModelId[];
  const currentDisplayedModelsSet = new Set(currentDisplayedModels);
  const modelsByProvider = aiModelRegistry.getGroupedModelsByProvider();
  const listModelsByProvider = aiModelRegistry.getListModelsByProvider();

  const toggleModelDisplay = useEvent((modelId: QualifiedModelId) => {
    const newModels = currentDisplayedModelsSet.has(modelId)
      ? currentDisplayedModels.filter((id) => id !== modelId)
      : [...currentDisplayedModels, modelId];

    form.setValue("ai.models.displayed_models", newModels, {
      shouldDirty: true,
      shouldTouch: true,
    });
    onSubmit(form.getValues());
  });

  const toggleProviderModels = useEvent(
    async (providerId: ProviderId, enable: boolean) => {
      const providerModels = modelsByProvider.get(providerId) || [];
      const qualifiedModelIds = new Set(
        providerModels.map((m) => new AiModelId(providerId, m.model).id),
      );

      // If enabled, we add all provider models that aren't already enabled
      // Else, remove all provider models
      const newModels: QualifiedModelId[] = enable
        ? [...new Set([...currentDisplayedModels, ...qualifiedModelIds])]
        : currentDisplayedModels.filter((id) => !qualifiedModelIds.has(id));

      form.setValue("ai.models.displayed_models", newModels, {
        shouldDirty: true,
        shouldTouch: true,
      });
      onSubmit(form.getValues());
    },
  );

  const deleteModel = useEvent((modelId: QualifiedModelId) => {
    const newModels = customModels.filter((id) => id !== modelId);
    // Remove from displayed models if it's in there
    const newDisplayedModels = currentDisplayedModels.filter(
      (id) => id !== modelId,
    );
    form.setValue("ai.models.displayed_models", newDisplayedModels, {
      shouldDirty: true,
      shouldTouch: true,
    });
    form.setValue("ai.models.custom_models", newModels, {
      shouldDirty: true,
      shouldTouch: true,
    });
    onSubmit(form.getValues());
  });

  return (
    <SettingGroup className="gap-2">
      <p className="text-sm text-muted-secondary">
        控制模型选择下拉框中显示哪些 AI 模型。未选择模型时，将显示所有可用模型。
      </p>

      <div className="bg-background">
        <Tree
          aria-label="按提供方分类的 AI 模型"
          className="flex-1 overflow-auto outline-none focus-visible:outline-none"
          selectionMode="none"
        >
          {listModelsByProvider.map(([providerId, models]) => (
            <ProviderTreeItem
              key={providerId}
              providerId={providerId}
              models={models}
              enabledModels={currentDisplayedModelsSet}
              onToggleModel={toggleModelDisplay}
              onToggleProvider={toggleProviderModels}
              onDeleteModel={deleteModel}
            />
          ))}
        </Tree>
      </div>
      <AddModelForm
        form={form}
        customModels={customModels}
        customProviderNames={customProviderNames}
        onSubmit={onSubmit}
      />
    </SettingGroup>
  );
};

export const AddModelForm: React.FC<{
  form: UseFormReturn<UserConfig>;
  customModels: QualifiedModelId[];
  customProviderNames: string[];
  onSubmit: (values: UserConfig) => void;
}> = ({ form, customModels, customProviderNames, onSubmit }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [modelAdded, setModelAdded] = useState(false);
  const [provider, setProvider] = useState<ProviderId | "custom" | null>(null);
  const [customProviderName, setCustomProviderName] = useState("");
  const [modelName, setModelName] = useState("");

  const providerSelectId = useId();
  const customProviderInputId = useId();
  const modelNameInputId = useId();

  const isCustomProvider = provider === "custom";
  const providerName = isCustomProvider ? customProviderName : provider;
  const hasValidValues = providerName?.trim() && modelName?.trim();

  const resetForm = () => {
    setProvider(null);
    setCustomProviderName("");
    setModelName("");
    setIsFormOpen(false);
  };

  const handleAddModel = () => {
    if (!hasValidValues) {
      return;
    }

    const newModel = new AiModelId(
      providerName as ProviderId,
      modelName as ShortModelId,
    );

    form.setValue("ai.models.custom_models", [newModel.id, ...customModels], {
      shouldDirty: true,
      shouldTouch: true,
    });
    onSubmit(form.getValues());
    resetForm();

    // Show model added message for 2 seconds
    setModelAdded(true);
    setTimeout(() => setModelAdded(false), 2000);
  };

  const providerClassName = "w-40 truncate";

  const providerSelect = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
          <Label
            htmlFor={providerSelectId}
            className="text-sm font-medium text-muted-foreground min-w-12"
          >
            提供方
          </Label>
        <Select
          value={provider || ""}
          onValueChange={(v) => setProvider(v as ProviderId | "custom")}
        >
          <SelectTrigger id={providerSelectId} className={providerClassName}>
            {provider ? (
              <div className="flex items-center gap-1.5">
                <AiProviderIcon
                  provider={provider as ProviderId}
                  className="h-3.5 w-3.5"
                />
                <span>{getProviderLabel(provider as ProviderId)}</span>
              </div>
            ) : (
          <span className="text-muted-foreground">请选择...</span>
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {customProviderNames.length > 0 && (
                <>
                  <p className="px-2 py-1 text-xs text-muted-secondary font-medium">
                    自定义提供方
                  </p>
                  {customProviderNames.map((p) => (
                    <SelectItem key={p} value={p}>
                      <div className="flex items-center gap-2">
                        <AiProviderIcon provider={p} className="h-4 w-4" />
                        <span>{Strings.startCase(p)}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <p className="px-2 py-1 text-xs text-muted-secondary font-medium mt-1">
                    内置提供方
                  </p>
                </>
              )}
              {KNOWN_PROVIDERS.filter(
                (p) => p !== "marimo" && !customProviderNames.includes(p),
              ).map((p) => (
                <SelectItem key={p} value={p}>
                  <div className="flex items-center gap-2">
                    <AiProviderIcon provider={p} className="h-4 w-4" />
                    <span>{getProviderLabel(p)}</span>
                  </div>
                </SelectItem>
              ))}
              <p className="px-2 py-1 text-xs text-muted-secondary font-medium mt-1">
                其他
              </p>
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <AiProviderIcon
                    provider="openai-compatible"
                    className="h-4 w-4"
                  />
                    <span>输入提供方名称</span>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {isCustomProvider && (
        <div className="flex items-center gap-2">
          <Label
            htmlFor={customProviderInputId}
            className="text-sm font-medium text-muted-foreground min-w-12"
          >
            Name
          </Label>
          <Input
            id={customProviderInputId}
            value={customProviderName}
            onChange={(e) => setCustomProviderName(e.target.value)}
            placeholder="openrouter"
            className={providerClassName}
          />
        </div>
      )}
    </div>
  );

  const modelInput = (
    <div
      className={cn(
        "flex items-center gap-2",
        isCustomProvider && "self-start",
      )}
    >
      <Label
        htmlFor={modelNameInputId}
        className="text-sm font-medium text-muted-foreground"
      >
        模型
      </Label>
      <Input
        id={modelNameInputId}
        value={modelName}
        onChange={(e) => setModelName(e.target.value)}
        placeholder="gpt-4"
        className="text-xs mb-0"
      />
    </div>
  );

  const inputForm = (
    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
      {providerSelect}
      {modelInput}
      <div
        className={cn("flex gap-1.5 ml-auto", isCustomProvider && "self-end")}
      >
              <Button onClick={handleAddModel} disabled={!hasValidValues} size="xs">
                添加
              </Button>
              <Button variant="outline" onClick={resetForm} size="xs">
                取消
              </Button>
      </div>
    </div>
  );

  return (
    <div>
      {isFormOpen && inputForm}
      <div className="flex flex-row text-sm">
        <AddButton
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
          label="添加模型"
          className="pl-2"
        />
        {modelAdded && (
          <div className="flex items-center gap-1 text-green-700 bg-green-500/10 px-2 py-1 rounded-md ml-auto">
            ✓ 已添加模型
          </div>
        )}
      </div>
    </div>
  );
};

const AddButton = ({
  isFormOpen,
  setIsFormOpen,
  label,
  className,
}: {
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
  label: string;
  className?: string;
}) => {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsFormOpen(true);
      }}
      variant="link"
      disabled={isFormOpen}
      className={cn("px-0", className)}
    >
      <PlusIcon className="h-4 w-4 mr-2 mb-0.5" />
      {label}
    </Button>
  );
};

export type AiSettingsSubTab =
  | "ai-features"
  | "ai-providers"
  | "ai-models"
  | "mcp";

export const AiConfig: React.FC<AiConfigProps> = ({
  form,
  config,
  onSubmit,
}) => {
  // MCP is not supported in WASM
  const wasm = isWasm();
  const [activeTab, setActiveTab] = useAtom(aiSettingsSubTabAtom);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as AiSettingsSubTab)}
      className="flex-1"
    >
      <TabsList className="mb-2">
        <TabsTrigger value="ai-features">AI 功能</TabsTrigger>
        <TabsTrigger value="ai-providers">AI 提供方</TabsTrigger>
        <TabsTrigger value="ai-models">AI 模型</TabsTrigger>
        {!wasm && <TabsTrigger value="mcp">MCP</TabsTrigger>}
      </TabsList>

      <TabsContent value="ai-features">
        <AiCodeCompletionConfig
          form={form}
          config={config}
          onSubmit={onSubmit}
        />
        <AiAssistConfig form={form} config={config} onSubmit={onSubmit} />
      </TabsContent>
      <TabsContent value="ai-providers">
        <AiProvidersConfig form={form} config={config} onSubmit={onSubmit} />
      </TabsContent>
      <TabsContent value="ai-models">
        <AiModelDisplayConfig form={form} config={config} onSubmit={onSubmit} />
      </TabsContent>
      {!wasm && (
        <TabsContent value="mcp">
          <MCPConfig form={form} onSubmit={onSubmit} />
        </TabsContent>
      )}
    </Tabs>
  );
};
