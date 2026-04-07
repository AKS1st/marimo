/* Copyright 2026 Marimo. All rights reserved. */

import type { ChangeEvent } from "react";
import type { FieldPath, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NativeSelect } from "@/components/ui/native-select";
import { NumberField } from "@/components/ui/number-field";
import type { UserConfig } from "@/core/config/config-schema";
import { Checkbox } from "../ui/checkbox";
import {
  formItemClasses,
  SettingGroup,
  SQL_OUTPUT_SELECT_OPTIONS,
} from "./common";
import { IsOverridden } from "./is-overridden";

const DISCOVERY_OPTIONS = ["auto", "true", "false"];

export const DataForm = ({
  form,
  config,
  onSubmit,
}: {
  form: UseFormReturn<UserConfig>;
  config: UserConfig;
  onSubmit: (values: UserConfig) => void;
}) => {
  const renderDiscoveryForm = (name: FieldPath<UserConfig>, label: string) => {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => {
          const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            field.onChange(
              value === "true" ? true : value === "false" ? false : value,
            );
          };
          return (
            <FormItem className={formItemClasses}>
              <FormLabel className="text-sm font-normal w-16">
                {label}
              </FormLabel>
              <FormControl>
                <NativeSelect
                  data-testid="auto-discover-schemas-select"
                  onChange={onChange}
                  value={
                    field.value === undefined ? "auto" : field.value.toString()
                  }
                  disabled={field.disabled}
                  className="w-[100px]"
                >
                  {DISCOVERY_OPTIONS.map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <IsOverridden userConfig={config} name={name} />
            </FormItem>
          );
        }}
      />
    );
  };

  return (
    <>
      <FormField
        control={form.control}
        name="display.dataframes"
        render={({ field }) => (
          <div className="flex flex-col space-y-1">
            <FormItem className={formItemClasses}>
              <FormLabel>数据表查看器</FormLabel>
              <FormControl>
                <NativeSelect
                  data-testid="display-dataframes-select"
                  onChange={(e) => field.onChange(e.target.value)}
                  value={field.value}
                  disabled={field.disabled}
                  className="inline-flex mr-2"
                >
                  {["rich", "plain"].map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage />
              <IsOverridden userConfig={config} name="display.dataframes" />
            </FormItem>

            <FormDescription>
              选择使用 marimo 的富数据表查看器，还是普通的 HTML 表格。
              这需要重启 notebook 才会生效。
            </FormDescription>
          </div>
        )}
      />
      <FormField
        control={form.control}
        name="display.default_table_page_size"
        render={({ field }) => (
          <div className="flex flex-col space-y-1">
            <FormItem className={formItemClasses}>
              <FormLabel>默认表格分页大小</FormLabel>
              <FormControl>
                <NumberField
                  aria-label="Default table page size"
                  data-testid="default-table-page-size-input"
                  className="m-0 w-24"
                  {...field}
                  value={field.value}
                  minValue={1}
                  step={1}
                  onChange={(value) => {
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
                name="display.default_table_page_size"
              />
            </FormItem>
            <FormDescription>
              数据表和 SQL 结果中默认显示的行数。
            </FormDescription>
          </div>
        )}
      />
      <FormField
        control={form.control}
        name="display.default_table_max_columns"
        render={({ field }) => (
          <div className="flex flex-col space-y-1">
            <FormItem className={formItemClasses}>
              <FormLabel>默认表格最大列数</FormLabel>
              <FormControl>
                <NumberField
                  aria-label="Default table max columns"
                  data-testid="default-table-max-columns-input"
                  className="m-0 w-24"
                  {...field}
                  value={field.value}
                  minValue={1}
                  step={1}
                  onChange={(value) => {
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
                name="display.default_table_max_columns"
              />
            </FormItem>
            <FormDescription>
              数据表和 SQL 结果中默认显示的最大列数。
            </FormDescription>
          </div>
        )}
      />

      <SettingGroup title="SQL">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-foreground">
            数据库模式发现
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            是否自动发现数据库的模式、表和列。
            <br />
            <span className="font-semibold">
              对大型数据库来说开销可能很高。
            </span>{" "}
            使用“auto”可让 marimo 根据{" "}
            <a
              className="text-link hover:underline"
              rel="noopener noreferrer"
              target="_blank"
              href="https://docs.marimo.io/guides/working_with_data/sql/?h=database#database-schema-and-table-auto-discovery"
            >
              数据库
            </a>
            来决定是否进行 introspection。
          </div>

          {renderDiscoveryForm("datasources.auto_discover_schemas", "模式")}
          {renderDiscoveryForm("datasources.auto_discover_tables", "表")}
          {renderDiscoveryForm("datasources.auto_discover_columns", "列")}
        </div>

        <FormField
          control={form.control}
          name="diagnostics.sql_linter"
          render={({ field }) => (
            <div className="flex flex-col space-y-1">
              <FormItem className={formItemClasses}>
                <FormLabel>SQL 代码检查</FormLabel>
                <FormControl>
                  <Checkbox
                    data-testid="sql-linter-checkbox"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
                <IsOverridden
                  userConfig={config}
                  name="diagnostics.sql_linter"
                />
              </FormItem>
              <FormDescription>
                为 SQL 单元格提供更好的代码检查和自动补全。
              </FormDescription>
            </div>
          )}
        />

        <FormField
          control={form.control}
          name="runtime.default_sql_output"
          render={({ field }) => (
            <div className="flex flex-col space-y-1">
              <FormItem className={formItemClasses}>
                <FormLabel>默认 SQL 输出</FormLabel>
                <FormControl>
                  <NativeSelect
                    data-testid="user-config-sql-output-select"
                    onChange={(e) => field.onChange(e.target.value)}
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
                <IsOverridden
                  userConfig={config}
                  name="runtime.default_sql_output"
                />
              </FormItem>

              <FormDescription>
                新 notebook 的默认 SQL 输出类型；会被应用配置中的 "sql_output"
                覆盖。
              </FormDescription>
            </div>
          )}
        />
      </SettingGroup>
    </>
  );
};
