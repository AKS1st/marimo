# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.3.8"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # Pandas DataFrame：按列值属性选择行
        """
    )
    return


@app.cell
def __(mo):
    mo.md(
        r"""
        使用 Series 的 `map()` 方法。
        例如，要按某列值的长度进行过滤：
        """
    )
    return


@app.cell
def __():
    import pandas as pd

    df = pd.DataFrame(
        {
            "first_name": ["Sarah", "John", "Kyle"],
            "last_name": ["Connor", "Connor", "Reese"],
        }
    )

    df[df["last_name"].map(len) == 5]
    return df, pd


@app.cell
def __():
    import marimo as mo

    return (mo,)


if __name__ == "__main__":
    app.run()

