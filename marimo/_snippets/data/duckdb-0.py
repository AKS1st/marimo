# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # DuckDB：基础 SQL 查询与 DataFrame 集成

        这个示例演示如何使用 `marimo` 的 SQL 单元，对本地 Pandas DataFrame
        执行查询。这里通过 f-string 插值实现参数化查询。
        """
    )
    return


@app.cell
def _():
    import polars as pl
    # 创建一个示例 DataFrame
    data = {
        'id': list(range(1, 11)),
        'value': [x * 10 for x in range(1, 11)]
    }
    df = pl.DataFrame(data)
    return data, df, pl


@app.cell
def _():
    max_rows = 5
    return (max_rows,)


@app.cell
def _(df, max_rows, mo):
    limited_df = mo.sql(
        f"""
        SELECT * FROM df LIMIT {max_rows}
        """
    )
    return (limited_df,)


@app.cell
def _(df, max_rows, mo):
    result_df = mo.sql(
        f"""
        SELECT * FROM df WHERE value > {max_rows * 10}
        """
    )
    return (result_df,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
