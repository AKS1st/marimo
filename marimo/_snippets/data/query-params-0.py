# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.4.0"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # 查询参数：读取查询参数

        使用 `mo.query_params` 访问传递给 notebook 的查询参数。
        """
    )
    return


@app.cell
def __(mo):
    params = mo.query_params()
    print(params)
    return (params,)


@app.cell
def __():
    import marimo as mo

    return (mo,)


if __name__ == "__main__":
    app.run()
