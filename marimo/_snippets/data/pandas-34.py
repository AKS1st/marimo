# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(r"""# Pandas：内存优化与类型管理""")
    return


@app.cell
def _():
    import pandas as pd

    # 创建包含不同数据类型的示例 DataFrame
    df = pd.DataFrame({
        'int_col': range(1000),
        'float_col': [1.5] * 1000,
        'str_col': ['A'] * 1000,
        'category_col': ['A', 'B', 'C'] * 333 + ['A']  # Make it 1000 rows
    })

    # 内存优化
    df['category_col'] = df['category_col'].astype('category')
    df['int_col'] = df['int_col'].astype('int32')

    # 获取内存占用
    memory_usage = df.memory_usage(deep=True)
    dtypes = df.dtypes
    return df, dtypes, memory_usage, pd


@app.cell
def _(memory_usage):
    memory_usage
    return


@app.cell
def _(dtypes):
    dtypes
    return


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

