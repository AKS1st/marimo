# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.11.0"
app = marimo.App(width="medium")


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        # Hugging Face：用 Polars 处理数据集

        使用 [Polars](https://www.pola.rs/) 从 [Hugging Face Datasets](https://huggingface.co/datasets) 获取任意数据集。
        """
    )
    return


@app.cell
def _():
    import polars as pl
    return (pl,)


@app.cell
def _(pl):
    df = pl.read_csv("hf://datasets/scikit-learn/Fish/Fish.csv")
    df
    return (df,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
