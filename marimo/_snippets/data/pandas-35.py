# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(r"""# Pandas：使用 melt 进行数据重塑""")
    return


@app.cell
def _():
    import pandas as pd

    # 创建宽格式数据
    df = pd.DataFrame({
        'id': ['A', 'B', 'C'],
        'score_2020': [75, 85, 95],
        'score_2021': [80, 90, 100],
        'score_2022': [85, 95, 105]
    })

    # Reshape from wide to long format
    melted_df = df.melt(
        id_vars=['id'],
        value_vars=['score_2020', 'score_2021', 'score_2022'],
        var_name='year',
        value_name='score'
    )

    melted_df
    return df, melted_df, pd


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
