# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # Polars：滚动均值与 Z 分数计算

        这个示例展示如何在 Polars 中使用 `rolling_mean()`、`over()` 聚合，
        and type casting with the expression API.
        """
    )
    return


@app.cell
def __():
    import polars as pl
    from datetime import datetime, timedelta

    # 创建示例 DataFrame with proper datetime
    df = pl.DataFrame({
        'id': range(1000),
        'value': [1.5, 2.5, 3.5] * 333 + [1.5],
        'category': ['A', 'B', 'C'] * 333 + ['A'],
        'date': [(datetime(2024, 1, 1) + timedelta(days=x)) for x in range(1000)]
    })

    # Demonstrate advanced expressions
    result = (
        df.lazy()
        .with_columns([
            pl.col('value').sum().over('category').alias('category_sum'),
            pl.col('value').rolling_mean(3).alias('rolling_avg'),
            pl.col('date').dt.month().cast(pl.Categorical).alias('month'),
            ((pl.col('value') - pl.col('value').mean()) /
             pl.col('value').std()).alias('zscore')
        ])
        .collect()
    )

    return df, result, pl


@app.cell
def __():
    import marimo as mo
    return mo,


if __name__ == "__main__":
    app.run()

