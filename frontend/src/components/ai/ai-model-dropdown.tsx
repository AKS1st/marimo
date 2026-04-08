/* Copyright 2026 Marimo. All rights reserved. */

import type { Role } from "@marimo-team/llm-info";
import { useAtomValue } from "jotai";
import {
  BotIcon,
  BrainIcon,
  ChevronDownIcon,
  CircleHelpIcon,
} from "lucide-react";
import React from "react";
import { type SupportedRole, useModelChange } from "@/core/ai/config";
import {
  AiModelId,
  isKnownAIProvider,
  type ProviderId,
  type QualifiedModelId,
} from "@/core/ai/ids/ids";
import { type AiModel, AiModelRegistry } from "@/core/ai/model-registry";
import { aiAtom, completionAtom } from "@/core/config/config";
import { capitalize } from "@/utils/strings";
import { useOpenSettingsToTab } from "../app-config/state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip } from "../ui/tooltip";
import { AiProviderIcon } from "./ai-provider-icon";
import { getCurrentRoleTooltip, getTagColour } from "./display-helpers";

function translateProviderDescription(description: string): string {
  const translations: Record<string, string> = {
    "OpenAI's API for GPT models, including GPT-3.5 and GPT-4.":
      "OpenAI 面向 GPT 模型的 API，包括 GPT-3.5 和 GPT-4。",
    "Amazon Bedrock provides access to foundation models from Amazon and leading AI startups via a unified API.":
      "Amazon Bedrock 通过统一 API 提供对 Amazon 及领先 AI 初创公司基础模型的访问。",
    "Azure provides access to models via the Azure cloud.":
      "Azure 通过 Azure 云提供模型访问。",
    "Anthropic's Claude models for conversational and completion tasks.":
      "Anthropic 的 Claude 模型，适用于对话和补全任务。",
    "Google's Vertex AI and PaLM APIs for generative and conversational models.":
      "Google 的 Vertex AI 和 PaLM API，面向生成式与对话式模型。",
    "Ollama is a lightweight, open-source model server for running and sharing LLMs.":
      "Ollama 是一个轻量级的开源模型服务器，用于运行和共享 LLM。",
    "GitHub's API for GPT models with GitHub-hosted models.":
      "GitHub 面向 GPT 模型的 API，支持 GitHub 托管模型。",
    "marimo's hosted models.":
      "marimo 托管的模型。",
    "DeepSeek's API for GPT models.":
      "DeepSeek 面向 GPT 模型的 API。",
    "LM Studio's API for GPT models.":
      "LM Studio 面向 GPT 模型的 API。",
    "OpenRouter's API for GPT models.":
      "OpenRouter 面向 GPT 模型的 API。",
    "Mistral's API for GPT models.":
      "Mistral 面向 GPT 模型的 API。",
    "Vercel's API for GPT models.":
      "Vercel 面向 GPT 模型的 API。",
    "Together AI's API for GPT models.":
      "Together AI 面向 GPT 模型的 API。",
    "xAI's API for GPT models.":
      "xAI 面向 GPT 模型的 API。",
    "Weights & Biases' hosted models for ML development and AI inference.":
      "Weights & Biases 托管的模型，面向机器学习开发和 AI 推理。",
  };

  return translations[description] ?? description;
}

interface AIModelDropdownProps {
  value?: string;
  placeholder?: string;
  onSelect?: (modelId: QualifiedModelId) => void;
  triggerClassName?: string;
  customDropdownContent?: React.ReactNode;
  iconSize?: "medium" | "small";
  showAddCustomModelDocs?: boolean;
  displayIconOnly?: boolean;
  forRole: SupportedRole;
}

export const AIModelDropdown = ({
  value,
  placeholder,
  onSelect,
  triggerClassName,
  customDropdownContent,
  iconSize = "medium",
  showAddCustomModelDocs = false,
  forRole,
  displayIconOnly = false,
}: AIModelDropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const ai = useAtomValue(aiAtom);
  const completion = useAtomValue(completionAtom);
  const { saveModelChange } = useModelChange();
  const { handleClick } = useOpenSettingsToTab();

  const autocompleteModel =
    completion.copilot === "custom"
      ? ai?.models?.autocomplete_model
      : undefined;

  const aiModelRegistry = AiModelRegistry.create({
    customModels: [
      ...(ai?.models?.custom_models ?? []),
      ai?.models?.chat_model,
      autocompleteModel,
      ai?.models?.edit_model,
    ].filter(Boolean),
    displayedModels: ai?.models?.displayed_models,
  });
  const modelsByProvider = aiModelRegistry.getListModelsByProvider();

  const activeModel =
    forRole === "autocomplete"
      ? ai?.models?.autocomplete_model
      : forRole === "chat"
        ? ai?.models?.chat_model
        : forRole === "edit"
          ? ai?.models?.edit_model
          : undefined;

  const currentValue = value
    ? AiModelId.parse(value)
    : activeModel
      ? AiModelId.parse(activeModel)
      : undefined;

  const iconSizeClass = iconSize === "medium" ? "h-4 w-4" : "h-3 w-3";

  const renderModelWithRole = (modelId: AiModelId, role: Role) => {
    const maybeModelMatch = aiModelRegistry.getModel(modelId.id);

    return (
      <div className="flex items-center gap-2 w-full px-2 py-1">
        <AiProviderIcon
          provider={modelId.providerId}
          className={iconSizeClass}
        />
        <div className="flex flex-col">
          <span>{maybeModelMatch?.name || modelId.shortModelId}</span>
          <span className="text-xs text-muted-foreground">{modelId.id}</span>
        </div>

        <div className="ml-auto flex gap-1">
          <Tooltip content={getCurrentRoleTooltip(role)}>
            <span
              key={role}
              className={`text-xs px-1.5 py-0.5 rounded font-medium ${getTagColour(role)}`}
            >
              {role}
            </span>
          </Tooltip>
        </div>
      </div>
    );
  };

  const handleSelect = (modelId: QualifiedModelId) => {
    if (onSelect) {
      onSelect(modelId);
    } else {
      saveModelChange(modelId, forRole);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className={`flex items-center justify-between px-2 py-0.5 border rounded-md
            hover:bg-accent hover:text-accent-foreground ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {currentValue ? (
            <>
              <AiProviderIcon
                provider={currentValue.providerId}
                className={iconSizeClass}
              />
              {displayIconOnly ? null : (
                <span className="truncate">
                  {isKnownAIProvider(currentValue.providerId)
                    ? currentValue.shortModelId
                    : currentValue.id}
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground truncate">
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDownIcon className={`${iconSizeClass} ml-1`} />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[300px]">
        {activeModel &&
          forRole &&
          renderModelWithRole(AiModelId.parse(activeModel), forRole)}
        {activeModel && forRole && <DropdownMenuSeparator />}

        {modelsByProvider.map(([provider, models]) => (
          <ProviderDropdownContent
            key={provider}
            provider={provider}
            onSelect={handleSelect}
            models={models}
            iconSizeClass={iconSizeClass}
          />
        ))}

        {customDropdownContent}

        {showAddCustomModelDocs && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="h-7 flex items-center gap-2"
              onClick={() => handleClick("ai", "ai-models")}
            >
              <CircleHelpIcon className="h-3 w-3" />
              <span className="cursor-pointer text-link">添加自定义模型</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ProviderDropdownContent = ({
  provider,
  onSelect,
  models,
  iconSizeClass,
}: {
  provider: ProviderId;
  onSelect: (modelId: QualifiedModelId) => void;
  models: AiModel[];
  iconSizeClass: string;
}) => {
  const iconProvider = isKnownAIProvider(provider)
    ? provider
    : "openai-compatible";

  const maybeProviderInfo = AiModelRegistry.getProviderInfo(provider);

  if (models.length === 0) {
    return null;
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <p className="flex items-center gap-2">
          <AiProviderIcon provider={iconProvider} className={iconSizeClass} />
          {getProviderLabel(provider)}
        </p>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent
          className="max-h-[40vh] overflow-y-auto"
          alignOffset={maybeProviderInfo ? -90 : 0}
          sideOffset={5}
        >
          {maybeProviderInfo && (
            <>
              <p className="text-sm text-muted-foreground p-2 max-w-[300px]">
                {translateProviderDescription(maybeProviderInfo.description)}
                <br />
              </p>

              <p className="text-sm text-muted-foreground p-2 pt-0">
                更多信息请查看{" "}
                <a
                  href={maybeProviderInfo.url}
                  target="_blank"
                  className="underline"
                  rel="noreferrer"
                  aria-label="提供方详情"
                >
                  提供方详情
                </a>
                .
              </p>
              <DropdownMenuSeparator />
            </>
          )}
          {models.map((model) => {
            const qualifiedModelId: QualifiedModelId = `${provider}/${model.model}`;
            return (
              <DropdownMenuSub key={qualifiedModelId}>
                <DropdownMenuSubTrigger showChevron={false} className="py-2">
                  <div
                    className="flex items-center gap-2 w-full cursor-pointer"
                    onClick={() => {
                      onSelect(qualifiedModelId);
                    }}
                  >
                    <AiModelDropdownItem model={model} provider={provider} />
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-4 w-80">
                  <AiModelInfoDisplay model={model} provider={provider} />
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            );
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};

const AiModelDropdownItem = ({
  model,
  provider,
}: {
  model: AiModel;
  provider: ProviderId;
}) => {
  const iconProvider = isKnownAIProvider(provider)
    ? provider
    : "openai-compatible";

  return (
    <>
      <AiProviderIcon provider={iconProvider} className="h-4 w-4" />
      <div className="flex flex-row w-full items-center">
        <span>{model.name}</span>
        <div className="ml-auto">
          {model.thinking && (
            <Tooltip content="推理模型">
              <BrainIcon
                className={`h-5 w-5 rounded-md p-1 ${getTagColour("thinking")}`}
              />
            </Tooltip>
          )}
        </div>
      </div>
      {model.custom && (
        <Tooltip content="自定义模型">
          <BotIcon className="h-5 w-5" />
        </Tooltip>
      )}
    </>
  );
};

export const AiModelInfoDisplay = ({
  model,
  provider,
}: {
  model: AiModel;
  provider: ProviderId;
}) => {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-base text-foreground">
          {model.name}
        </h4>
        <p className="text-xs text-muted-foreground font-mono">{model.model}</p>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {model.description}
      </p>

      {model.roles.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            能力：
          </p>
          <div className="flex flex-wrap gap-1">
            {model.roles.map((role) => (
              <span
                key={role}
                className={`px-2 py-1 text-xs rounded-md font-medium ${getTagColour(role)}`}
                title={getCurrentRoleTooltip(role)}
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {model.thinking && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">支持思考模式</span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <AiProviderIcon provider={provider} className="h-4 w-4" />
        <span className="text-xs text-muted-foreground">
          {getProviderLabel(provider)}
        </span>
      </div>
    </div>
  );
};

export function getProviderLabel(provider: ProviderId): string {
  const providerInfo = AiModelRegistry.getProviderInfo(provider);
  if (providerInfo) {
    return providerInfo.name;
  }
  return capitalize(provider);
}
