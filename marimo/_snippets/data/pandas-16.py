# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.3.8"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # Pandas：从字符串创建 TimeDelta
        """
    )
    return


@app.cell
def __():
    import pandas as pd

    pd.Timedelta("2 days 2 hours 15 minutes 30 seconds")
    return (pd,)


@app.cell
def __():
    import marimo as mo

    return (mo,)


if __name__ == "__main__":
    app.run()
