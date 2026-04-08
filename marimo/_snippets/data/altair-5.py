# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.3.9"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # 可视化：Altair 交互式刷选

        在标准散点图的基础上只需加几行代码，就能为散点图添加选择行为。
        这样你就可以通过单击并拖拽来选择点。
        """
    )
    return


@app.cell
def __():
    # 加载示例数据集
    from vega_datasets import data

    cars = data.cars()

    import altair as alt

    interval = alt.selection_interval()

    alt.Chart(cars).mark_point().encode(
        x="Horsepower",
        y="Miles_per_Gallon",
        color=alt.condition(interval, "Origin", alt.value("lightgray")),
    ).add_params(interval)
    return alt, cars, data, interval


@app.cell
def __():
    import marimo as mo
    return mo,


if __name__ == "__main__":
    app.run()

