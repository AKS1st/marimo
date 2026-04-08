# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.4.0"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # 命令行参数：读取命令行参数

        使用 `mo.cli_args` 访问传递给 notebook 的命令行参数。
        例如，你可以在使用 `marimo run` 将 notebook 作为应用运行时传入参数。

        ```bash
        marimo run app.py -- --arg1 value1 --arg2 value2
        ```
        """
    )
    return


@app.cell
def __(mo):
    params = mo.cli_args()
    params
    return params,


@app.cell
def __():
    import marimo as mo
    return mo,


if __name__ == "__main__":
    app.run()
