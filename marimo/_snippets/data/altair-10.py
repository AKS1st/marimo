# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # 可视化：Altair 带小提琴层的箱线图

        使用 Altair 创建分层箱线图和小提琴图。箱线图通过 `mark_boxplot()` 展示四分位数
        小提琴图通过 `transform_density()` 展示密度分布。
        将两者结合可以同时看到摘要统计和完整分布。
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
    def create_box_violin_plot():
        # 加载数据集
        source = data.cars()

        # 创建箱线图的基础图表
        box_plot = alt.Chart(source).mark_boxplot(size=50).encode(  # Increased box size
            x=alt.X('Origin:N', axis=alt.Axis(labelFontSize=12, titleFontSize=14)),  # Larger font
            y=alt.Y('Horsepower:Q',
                    title='Horsepower',
                    scale=alt.Scale(zero=False),
                    axis=alt.Axis(labelFontSize=12, titleFontSize=14)),  # Larger font
            color=alt.Color('Origin:N', legend=alt.Legend(labelFontSize=12, titleFontSize=14))  # Larger legend
        )

        # 创建小提琴图层
        violin = alt.Chart(source).transform_density(
            'Horsepower',
            as_=['Horsepower', 'density'],
            groupby=['Origin']
        ).mark_area(
            opacity=0.3
        ).encode(
            x='Origin:N',
            y='Horsepower:Q',
            color='Origin:N',
            fill='Origin:N'
        )

        # Combine the layers
        chart = (violin + box_plot).properties(
            width=600,  # Much larger width
            height=500,  # Much larger height
            title={
                'text': 'Horsepower Distribution by Origin',
                'fontSize': 16  # Larger title
            }
        ).configure_axis(
            labelFontSize=12,
            titleFontSize=14
        ).interactive()

        return chart

    create_box_violin_plot()
    return (create_box_violin_plot,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

