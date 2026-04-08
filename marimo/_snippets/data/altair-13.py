# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # 可视化：Altair 分布图

        使用 `mark_area()` 和 `transform_density()` 创建分布可视化。
        常用于借助交互式提示框比较不同类别的分布。
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
    def create_distribution_plot():
        # 加载数据集
        source = data.cars()

        # 创建分布图
        chart = alt.Chart(source).transform_density(
            'Miles_per_Gallon',
            groupby=['Origin'],
            as_=['Miles_per_Gallon', 'density']
        ).mark_area(
            opacity=0.5
        ).encode(
            x='Miles_per_Gallon:Q',
            y='density:Q',
            color='Origin:N',
            tooltip=['Origin:N', alt.Tooltip('density:Q', format='.3f')]
        ).properties(
            width=400,
            height=300,
            title='MPG Distribution by Origin'
        ).interactive()

        return chart

    create_distribution_plot()
    return (create_distribution_plot,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

