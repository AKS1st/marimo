# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Polars：使用数据类型进行内存优化

        这个示例演示如何在 Polars 中使用字符串的 `Categorical` 类型来优化内存，
        smaller numeric types like `Float32`, and lazy evaluation.
        Converting string columns to categorical can reduce memory usage.
        """
    )
    return


@app.cell
def _():
    import polars as pl
    import numpy as np

    # 创建包含高内存占用列的数据集
    df = pl.DataFrame(
        {
            "id": range(100_000),
            # 创建更长的字符串以展示内存占用
            "text": [
                f"very_long_string_that_repeats_many_times_{i % 100}"
                for i in range(100_000)
            ],
            "category": np.random.choice(
                ["Category_A", "Category_B", "Category_C"], 100_000
            ),
            "value": np.random.normal(100, 15, 100_000).astype(
                np.float64
            ),  # Explicitly use float64
        }
    )

    # Memory before optimization
    print(f"Before: {df.estimated_size() / 1e6:.1f}MB")

    # Optimize memory usage
    df_opt = df.with_columns(
        [
            pl.col("text").cast(pl.Categorical),
            pl.col("category").cast(pl.Categorical),
            pl.col("value").cast(pl.Float32),
            pl.col("id").cast(pl.UInt32),  # Optimize integer type
        ]
    )

    print(f"After: {df_opt.estimated_size() / 1e6:.1f}MB")
    return df, df_opt, np, pl


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

