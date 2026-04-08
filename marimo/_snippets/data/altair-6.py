# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.3.9"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # 可视化：Altair 联动刷选

        如果你把同一个选择条件应用到 Altair 图表的多个面板上，这些选择会联动。
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

    base = (
        alt.Chart(cars)
        .mark_point()
        .encode(
            y="Miles_per_Gallon",
            color=alt.condition(interval, "Origin", alt.value("lightgray")),
        )
        .add_params(interval)
    )

    base.encode(x="Acceleration") | base.encode(x="Horsepower")
    return alt, base, cars, data, interval


@app.cell
def __():
    import marimo as mo
    return mo,


if __name__ == "__main__":
    app.run()

