# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # 可视化：Altair 多视图仪表板

        使用 `alt.vconcat()` 和 `alt.hconcat()` 创建交互式仪表板。
        示例展示了如何通过 `alt.selection()` 创建联动视图来交叉筛选数据。
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
    def create_dashboard():
        # 加载数据集
        source = data.cars()

        # 创建联动所有视图的选择器
        brush = alt.selection_interval(name='select')

        # 散点图
        scatter = alt.Chart(source).mark_point().encode(
            x='Horsepower:Q',
            y='Miles_per_Gallon:Q',
            color=alt.condition(brush, 'Origin:N', alt.value('lightgray'))
        ).properties(
            width=300,
            height=200
        ).add_params(brush)

        # Histogram
        hist = alt.Chart(source).mark_bar().encode(
            x='Miles_per_Gallon:Q',
            y='count()',
            color='Origin:N'
        ).transform_filter(
            brush
        ).properties(
            width=300,
            height=100
        )

        # Combine views
        chart = alt.hconcat(scatter, hist)

        return chart

    create_dashboard()
    return (create_dashboard,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

