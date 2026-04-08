# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.4.0"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # 查询参数：写入查询参数

        你也可以使用 `mo.query_params` 设置查询参数，以便在 URL 中记录状态。
        这对于收藏书签，或者在使用 `marimo run` 将 notebook 作为应用运行时
        分享某个特定状态很有用。
        """
    )
    return


@app.cell
def __(mo):
    query_params = mo.query_params()
    return query_params,


@app.cell
def __(mo, query_params):
    slider = mo.ui.slider(
        0,
        10,
        value=query_params.get("slider") or 1,
        on_change=lambda x: query_params.set("slider", x),
    )
    slider
    return slider,


@app.cell
def __(mo, query_params):
    search = mo.ui.text(
        value=query_params.get("search") or "",
        on_change=lambda x: query_params.set("search", x),
    )
    search
    return search,


@app.cell
def __():
    import marimo as mo
    return mo,


if __name__ == "__main__":
    app.run()
