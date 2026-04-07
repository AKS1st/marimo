/* Copyright 2026 Marimo. All rights reserved. */
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAppConfig } from "@/core/config/config";
import { getAppWidths } from "@/core/config/widths";
import { useRequestClient } from "@/core/network/requests";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { arrayToggle } from "@/utils/arrays";
import {
  type AppConfig,
  AppConfigSchema,
  AppTitleSchema,
} from "../../core/config/config-schema";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Kbd } from "../ui/kbd";
import { ExternalLink } from "../ui/links";
import { NativeSelect } from "../ui/native-select";
import { toast } from "../ui/use-toast";
import {
  SettingDescription,
  SettingTitle,
  SQL_OUTPUT_SELECT_OPTIONS,
} from "./common";

const FORM_DEBOUNCE = 100; // ms;

export const AppConfigForm: React.FC = () => {
  const [config, setConfig] = useAppConfig();
  const { saveAppConfig } = useRequestClient();
  const htmlCheckboxId = useId();
  const ipynbCheckboxId = useId();

  // Create form
  const form = useForm({
    resolver: zodResolver(
      AppConfigSchema as unknown as z.ZodType<unknown, AppConfig>,
    ),
    defaultValues: config,
  });

  const onSubmit = async (values: AppConfig) => {
    await saveAppConfig({ config: values })
      .then(() => {
        setConfig(values);
      })
      .catch(() => {
        setConfig(values);
      });
  };

  const debouncedSubmit = useDebouncedCallback((v: AppConfig) => {
    onSubmit(v);
  }, FORM_DEBOUNCE);

  // When width is changed, dispatch a resize event so widgets know to resize
  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [config.width]);

  return (
    <Form {...form}>
      <form
        onChange={form.handleSubmit(debouncedSubmit)}
        className="flex flex-col gap-6"
      >
        <div>
          <SettingTitle>Notebook 设置</SettingTitle>
          <SettingDescription>
            配置 notebook 或应用的外观和行为。
          </SettingDescription>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <SettingSection title="显示">
            <FormField
              control={form.control}
              name="width"
              render={({ field }) => (
                <FormItem
                  className={"flex flex-row items-center space-x-1 space-y-0"}
                >
                  <FormLabel>宽度</FormLabel>
                  <FormControl>
                    <NativeSelect
                      data-testid="app-width-select"
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
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="app_title"
              render={({ field }) => (
                <div className="flex flex-col gap-y-1">
                  <FormItem className="flex flex-row items-center space-x-1 space-y-0">
                    <FormLabel>应用标题</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          if (
                            AppTitleSchema.safeParse(e.target.value).success
                          ) {
                            document.title = e.target.value;
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormDescription>
                    应用标题会写入 HTML 的 title 标签中，通常会显示在浏览器窗口的标题栏里。
                  </FormDescription>
                </div>
              )}
            />
          </SettingSection>

          <SettingSection title="自定义文件">
            <FormField
              control={form.control}
              name="css_file"
              render={({ field }) => (
                <div className="flex flex-col gap-y-1">
                  <FormItem className="flex flex-row items-center space-x-1 space-y-0">
                     <FormLabel className="shrink-0">自定义 CSS</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="custom.css"
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          if (
                            AppTitleSchema.safeParse(e.target.value).success
                          ) {
                            document.title = e.target.value;
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormDescription>
                    要注入 notebook 的自定义 CSS 文件路径。
                  </FormDescription>
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="html_head_file"
              render={({ field }) => (
                <div className="flex flex-col gap-y-1">
                  <FormItem className="flex flex-row items-center space-x-1 space-y-0">
                     <FormLabel className="shrink-0">HTML 头部</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="head.html"
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormDescription>
                    要注入 notebook 的 HTML 文件路径，插入到{" "}
                    <Kbd className="inline">{"<head/>"}</Kbd> 部分。
                    可用于添加分析、字体、meta 标签或外部脚本。
                  </FormDescription>
                </div>
              )}
            />
          </SettingSection>

          <SettingSection title="数据">
            <FormField
              control={form.control}
              name="sql_output"
              render={({ field }) => (
                <div className="flex flex-col gap-y-1">
                  <FormItem
                    className={"flex flex-row items-center space-x-1 space-y-0"}
                  >
                    <FormLabel>SQL 输出类型</FormLabel>
                    <FormControl>
                      <NativeSelect
                        data-testid="sql-output-select"
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          toast({
                            title: "需要重启内核",
                            description:
                              "此更改需要重启内核后才会生效。",
                          });
                        }}
                        value={field.value}
                        disabled={field.disabled}
                        className="inline-flex mr-2"
                      >
                        {SQL_OUTPUT_SELECT_OPTIONS.map((option) => (
                          <option value={option.value} key={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormDescription>
                    SQL 单元格返回的 Python 类型。对于大型数据集，为获得最佳性能，我们建议使用{" "}
                    <Kbd className="inline">native</Kbd>。查看{" "}
                    <ExternalLink href="https://docs.marimo.io/guides/working_with_data/sql">
                      SQL 指南
                    </ExternalLink>{" "}
                    了解更多。
                  </FormDescription>
                </div>
              )}
            />
          </SettingSection>

          <SettingSection title="导出输出">
            <FormField
              control={form.control}
              name="auto_download"
              render={({ field }) => (
                <div className="flex flex-col gap-y-1">
                  <FormItem className="flex flex-col gap-2">
                    <FormControl>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={htmlCheckboxId}
                            data-testid="html-checkbox"
                            checked={field.value.includes("html")}
                            onCheckedChange={() => {
                              field.onChange(arrayToggle(field.value, "html"));
                            }}
                          />
                          <FormLabel htmlFor={htmlCheckboxId}>HTML</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={ipynbCheckboxId}
                            data-testid="ipynb-checkbox"
                            checked={field.value.includes("ipynb")}
                            onCheckedChange={() => {
                              field.onChange(arrayToggle(field.value, "ipynb"));
                            }}
                          />
                          <FormLabel htmlFor={ipynbCheckboxId}>IPYNB</FormLabel>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormDescription>
                    启用后，marimo 会定期将此 notebook 以所选格式（HTML、IPYNB）
                    保存到 notebook 文件旁名为{" "}
                    <Kbd className="inline">__marimo__</Kbd> 的文件夹中。
                  </FormDescription>
                </div>
              )}
            />
          </SettingSection>
        </div>
      </form>
    </Form>
  );
};

const SettingSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-y-2">
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      {children}
    </div>
  );
};
