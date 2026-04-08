# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.10.12"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Pandas：描述列中的时间戳值
        """
    )
    return


@app.cell
def _():
    import pandas as pd

    df = pd.DataFrame({'timestamp': pd.date_range('2023-01-01', periods=5, freq='D')})

    df['timestamp'].describe()
    return df, pd


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
