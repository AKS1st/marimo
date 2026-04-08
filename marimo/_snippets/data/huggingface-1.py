# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.11.0"
app = marimo.App(width="medium")


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        # Hugging Face：用 SQL 处理数据集

        通过 [DuckDB](https://duckdb.org/) 使用 SQL 从 [Hugging Face Datasets](https://huggingface.co/datasets) 获取任意数据集。
        """
    )
    return


@app.cell
def _():
    import duckdb
    import polars as pl
    return duckdb, pl


@app.cell
def _(mo):
    data = mo.sql(
        f"""
        SELECT * FROM "hf://datasets/scikit-learn/Fish/Fish.csv"
        """
    )
    return (data,)


@app.cell
def _(data):
    # Get the SQL result back in Python
    data.describe()
    return


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
