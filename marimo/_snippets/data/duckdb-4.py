# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # DuckDB：参数化与响应式 SQL 查询

        这个示例展示如何在 marimo 中使用 Python 变量对 SQL 查询进行参数化，
        让查询能够动态反映 Python 值的变化。
        """
    )
    return


@app.cell
def _():
    import polars as pl
    # 创建一个用于响应式过滤的示例 DataFrame
    data = {'id': list(range(1, 21)), 'score': [x * 5 for x in range(1, 21)]}
    df = pl.DataFrame(data)
    return data, df, pl


@app.cell
def _(mo):
    min_score = mo.ui.number(label="最低分数", value=50, start=0)
    return (min_score,)


@app.cell
def _(min_score):
    min_score
    return


@app.cell
def _(df, min_score, mo):
    result = mo.sql(
        f"""
        SELECT * FROM df WHERE score >= {min_score.value}
        """
    )
    return (result,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
