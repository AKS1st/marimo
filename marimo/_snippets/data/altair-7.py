# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.3.9"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # 可视化：Altair 联动散点图与直方图

        Altair 的选择器可用于很多场景。这个示例展示了散点图和直方图上的联动选择，
        便于探索点之间的关系。
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

    points = (
        alt.Chart(cars)
        .mark_point()
        .encode(
            x="Horsepower",
            y="Miles_per_Gallon",
            color=alt.condition(interval, "Origin", alt.value("lightgray")),
        )
        .add_params(interval)
    )

    histogram = (
        alt.Chart(cars)
        .mark_bar()
        .encode(x="count()", y="Origin", color="Origin")
        .transform_filter(interval)
    )

    points & histogram
    return alt, cars, data, histogram, interval, points


@app.cell
def __():
    import marimo as mo
    return mo,


if __name__ == "__main__":
    app.run()

