# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Polars：字符串操作与模式匹配

        这个示例演示如何在 Polars 中使用模式匹配、
        变换和正则表达式进行高效字符串操作。它展示了如何使用 `str.replace()`
        清理字符串、用 `str.extract()` 提取模式，以及使用 `Categorical` 类型优化内存。

        例如：`df.with_columns(pl.col("text").str.extract(r"pattern_(\d+)", 1))`
        """
    )
    return


@app.cell
def _():
    import polars as pl

    # 创建包含多种模式的示例文本数据
    df = pl.DataFrame({
        'structured_text': ['User_' + str(i % 100) + '_Category_' + str(i % 3) for i in range(5)],
        'email': [f'user{i}@example.com' for i in range(5)],
        'mixed_text': [
            'user123@email.com',
            'JOHN DOE',
            'phone: 123-456-7890',
            'address: 123 Main St.',
            'support@company.com'
        ]
    })

    # 综合字符串操作
    result = (
        df.lazy()
        .with_columns([
            # 基本变换
            pl.col('mixed_text').str.to_lowercase().alias('lowercase_text'),
            pl.col('structured_text').str.replace_all('_', ' ').alias('cleaned_text'),

            # 模式提取
            pl.col('structured_text').str.extract(r'Category_(\d+)', 1).alias('category_num'),
            pl.col('email').str.split('@').list.get(0).alias('email_username'),

            # 模式匹配
            pl.col('mixed_text').str.contains(r'@').alias('is_email'),
            pl.col('mixed_text').str.contains(r'\d{3}-\d{3}-\d{4}').alias('is_phone'),

            # 高级替换
            pl.col('mixed_text').str.replace(
                r'\d{3}-\d{3}-\d{4}',
                'XXX-XXX-XXXX'
            ).alias('masked_phone'),

            # 对重复值进行分类优化
            pl.col('structured_text').cast(pl.Categorical).alias('categorical_text')
        ])
        .collect()
    )
    result
    return df, pl, result


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

