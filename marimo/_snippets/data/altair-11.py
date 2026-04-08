# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # 可视化：Altair 分面图表

        分面图会按类别将数据拆分为多个视图，便于发现模式并比较不同组。
        它基于 Altair 的 `facet()` 方法构建，并通过 `.interactive()` 提供交互式缩放和平移控制。
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
    def create_faceted_chart():
        # 加载数据集
        source = data.cars()

        # 创建交互式基础散点图
        base = alt.Chart(source).mark_point().encode(
            x='Horsepower:Q',
            y='Miles_per_Gallon:Q',
            color='Origin:N',
            tooltip=['Name', 'Origin', 'Horsepower', 'Miles_per_Gallon']
        ).properties(
            width=180,
            height=180
        ).interactive()  # Make base chart interactive

        # 创建分面图
        chart = base.facet(
            column='Cylinders:O',
            title='Miles per Gallon vs. Horsepower by # Cylinders'
        ).configure_header(
            labelFontSize=12,
            titleFontSize=14
        ).configure_title(
            fontSize=16
        )

        return chart

    create_faceted_chart()
    return (create_faceted_chart,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

