# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Polars：缺失数据与数据质量

        这个示例演示如何在 Polars 中高效处理缺失值、数据校验，
        以及类型转换。

        例如：`df.with_columns(pl.col('value').fill_null(pl.col('value').mean()))`
        """
    )
    return


@app.cell
def _():
    import polars as pl
    import numpy as np

    # 创建包含缺失值的示例数据
    df = pl.DataFrame({
        'id': range(1000),
        'category': ['A', 'B', None, 'C'] * 250,
        'value': [1.5, None, 3.5, 4.5] * 250
    })

    # 数据质量操作
    result = (
        df.lazy()
        .with_columns([
            pl.col('category').fill_null('Unknown').alias('category_clean'),
            pl.col('value').fill_null(pl.col('value').mean()).alias('value_clean'),
            pl.col('category').cast(pl.Categorical).alias('category_optimized')
        ])
        .collect()
    )

    # 计算数据质量指标
    quality_metrics = {
        'null_counts': df.null_count(),
        'unique_categories': df.get_column('category').n_unique()
    }
    result, quality_metrics
    return df, np, pl, quality_metrics, result


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

