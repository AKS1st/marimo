# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # DuckDB：带聚合与窗口函数的高级 SQL

        这个示例演示使用 DuckDB 进行高级 SQL 查询，包括 group-by 聚合和
        窗口函数（例如累计求和）。
        """
    )
    return


@app.cell
def _():
    import polars as pl
    # 创建示例 DataFrame
    data = {
        'group': ['A', 'A', 'B', 'B', 'C', 'C'],
        'value': [10, 15, 20, 25, 30, 35]
    }
    df = pl.DataFrame(data)
    return data, df, pl


@app.cell
def _(df, mo):
    agg_df = mo.sql(
        f"""
        SELECT
            "group",
            CAST(AVG(value) AS FLOAT) as avg_value
        FROM df
        GROUP BY "group"
        """
    )
    return (agg_df,)


@app.cell
def _(df, mo):
    window_df = mo.sql(
        f"""
        SELECT
            *,
            CAST(SUM(value) OVER (PARTITION BY "group" ORDER BY value) AS FLOAT) as cumulative_sum
        FROM df
        """
    )
    return (window_df,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

