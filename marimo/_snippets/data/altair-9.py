# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # 可视化：Altair 热力图

        这个示例演示如何使用 Altair 的
        `rect` 标记类型和颜色编码创建热力图。热力图非常适合展示
        矩阵结构数据中的模式。
        """
    )
    return


@app.cell
def _():
    from vega_datasets import data
    import altair as alt
    import pandas as pd
    return alt, data, pd


@app.cell
def _(alt, data):
    def create_heatmap():

        # 加载并准备数据
        source = data.seattle_weather()
        # 创建热力图
        chart = alt.Chart(source).mark_rect().encode(
            x=alt.X('date:O', timeUnit='month', title='Month'),
            y=alt.Y('date:O', timeUnit='day', title='Day'),
            color=alt.Color('temp_max:Q', title='Maximum Temperature (°C)'),
            tooltip=[
                alt.Tooltip('monthdate(date):T', title='Date'),
                alt.Tooltip('temp_max:Q', title='Max Temperature')
            ]
        ).properties(
            width=300,
            height=200,
            title='Seattle Weather Heat Map'
        ).interactive()

        return chart

    create_heatmap()
    return (create_heatmap,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

