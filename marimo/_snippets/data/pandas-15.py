# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.3.8"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # Pandas：使用可用 kwargs 创建 TimeDelta
        """
    )
    return


@app.cell
def __(mo):
    mo.md(
        r"""
        例如可用的关键字参数：{days, seconds, microseconds, milliseconds, minutes, hours, weeks}
        """
    )
    return


@app.cell
def __():
    import pandas as pd

    pd.Timedelta(days=2)
    return (pd,)


@app.cell
def __():
    import marimo as mo

    return (mo,)


if __name__ == "__main__":
    app.run()
