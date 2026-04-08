# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.3.9"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # 可视化：Altair 时间序列折线图

        Altair 通过使用 ``:T`` 类型标记原生支持时间类型。
        这个示例展示了股票价格随时间变化的图表。
        """
    )
    return


@app.cell
def __():
    from vega_datasets import data

    stocks = data.stocks()

    import altair as alt

    alt.Chart(stocks).mark_line().encode(
        x="date:T", y="price", color="symbol"
    ).interactive(bind_y=False)
    return alt, data, stocks


@app.cell
def __():
    import marimo as mo
    return mo,


if __name__ == "__main__":
    app.run()
