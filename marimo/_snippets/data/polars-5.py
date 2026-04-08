# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Polars：CSV 操作

        展示 Polars 的 CSV 能力，使用 `scan_csv()` 流式处理大型 CSV 数据集。
        该示例展示了内存高效的过滤和惰性求值聚合。

        示例：`pl.scan_csv("data.csv").filter(pl.col("value") > 500).collect()`
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

    # 创建临时目录并保存 CSV
    temp_dir = Path(tempfile.mkdtemp())
    csv_path = temp_dir / 'data.csv'
    df.write_csv(csv_path)

    # 演示过滤后的 CSV 读取
    csv_filtered = (
        pl.scan_csv(csv_path)
        .filter(pl.col('category') == 'A')
        .collect()
    )
    csv_filtered
    return (
        Path,
        csv_filtered,
        csv_path,
        datetime,
        df,
        pl,
        temp_dir,
        tempfile,
    )


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

