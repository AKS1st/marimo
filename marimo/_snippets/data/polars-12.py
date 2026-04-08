# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Polars：惰性求值与 Parquet 流式处理

        示例展示 Polars 在大型数据集上的流式处理能力，使用惰性求值
        展示如何在不把整个数据集加载到内存中的情况下高效处理数据。

        例如：`pl.scan_parquet("data.parquet").filter(pl.col("date").dt.year() == 2024).collect()`
        """
    )
    return


@app.cell
def _():
    import polars as pl
    import tempfile
    from pathlib import Path
    import datetime

    # 创建示例数据
    df = pl.DataFrame({
        'date': [(datetime.date(2024, 1, 1) + datetime.timedelta(days=x % 366)) for x in range(1000)],
        'category': ['A', 'B', 'C'] * 333 + ['A'],
        'value': range(1000)
    })

    # 创建临时目录并保存文件
    temp_dir = Path(tempfile.mkdtemp())
    parquet_path = temp_dir / 'data.parquet'
    df.write_parquet(parquet_path)

    # Demonstrate streaming with lazy evaluation
    streamed = (
        pl.scan_parquet(parquet_path)
        .filter(pl.col('date').dt.year() == 2024)
        .collect()
    )
    streamed
    return (
        Path,
        datetime,
        df,
        parquet_path,
        pl,
        streamed,
        temp_dir,
        tempfile,
    )


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

