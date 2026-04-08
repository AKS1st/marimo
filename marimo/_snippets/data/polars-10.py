# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Polars：数据标准化与组间比较

        这个示例演示 Polars 中的统计操作，包括摘要统计、
        correlations, standardization, and group comparisons.

        例如：`df.select([pl.all()]).describe()` 可用于汇总统计
        """
    )
    return


@app.cell
def _():
    import polars as pl
    import numpy as np

    # 创建示例数据set
    df = pl.DataFrame({
        'A': np.random.normal(10, 2, 1000),
        'B': np.random.normal(20, 5, 1000),
        'C': np.random.normal(0, 1, 1000),
        'group': ['X', 'Y'] * 500
    })

    # Basic statistics
    summary = df.select([
        pl.all().exclude('group'),
    ]).describe()

    # Correlation matrix
    corr = df.select([
        pl.all().exclude('group')
    ]).corr()

    # Z-score standardization
    z_scores = df.select([
        ((pl.col(c) - pl.col(c).mean()) / pl.col(c).std()).alias(f'{c}_zscore')
        for c in ['A', 'B', 'C']
    ])

    # Group comparison (basic t-test like)
    group_stats = df.group_by('group').agg([
        pl.col('A').mean().alias('mean'),
        pl.col('A').std().alias('std'),
        pl.col('A').count().alias('n')
    ])
    df, summary, corr, z_scores, group_stats
    return corr, df, group_stats, np, pl, summary, z_scores


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

