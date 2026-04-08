# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # 可视化：带渐变填充的面积图

        使用 `alt.Chart().mark_area()` 创建堆叠面积图。该示例演示了
        渐变填充和 `fillOpacity` 透明度设置，常用于
        可视化时间序列数据或整体与部分的关系。
        """
    )
    return


@app.cell
def _():
    from vega_datasets import data
    import altair as alt
    return alt, data


@app.cell
def _(alt, data):
    def create_area_chart():
        # 加载数据集
        source = data.stocks()

        # 创建带渐变的面积图
        chart = alt.Chart(source).transform_filter(
            alt.datum.symbol != 'IBM'  # Remove one symbol to avoid overcrowding
        ).mark_area(
            opacity=0.7,
            interpolate='monotone'
        ).encode(
            x='date:T',
            y=alt.Y('price:Q', stack=True),
            color=alt.Color('symbol:N', legend=alt.Legend(title='Company')),
            tooltip=['date', 'price', 'symbol']
        ).properties(
            width=600,
            height=300,
            title='Stock Prices Over Time'
        ).interactive()

        return chart

    create_area_chart()
    return (create_area_chart,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

