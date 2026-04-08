# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Polars：惰性求值

        这个示例展示如何使用 Polars 的 `lazy()` 惰性求值来优化查询规划、
        基于表达式的操作以及高内存效率的数据处理。下面是示例。
        """
    )
    return


@app.cell
def _():
    import polars as pl
    import numpy as np

    # 创建示例 DataFrame with numeric data
    df = pl.DataFrame({
        'id': range(1000),
        'category': ['A', 'B', 'C', 'D'] * 250,
        'values': np.arange(0, 2000, 2)
    })

    # 演示带优化查询的惰性求值
    lazy_query = (
        df.lazy()
        .filter(pl.col('values') > 500)
        .group_by('category')
        .agg([
            pl.col('values').mean().alias('avg_value'),
            pl.col('values').count().alias('count')
        ])
        .sort('avg_value', descending=True)
    )

    # 显示优化计划
    print("Lazy Query Plan:")
    print(lazy_query.explain())

    # 执行惰性查询
    result = lazy_query.collect()
    result
    return df, lazy_query, np, pl, result


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

