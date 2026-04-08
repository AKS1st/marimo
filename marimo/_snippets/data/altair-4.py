# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.3.9"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # 可视化：Altair 带滚动均值的散点图

        这展示了一个散点图：每加仑英里数随年份变化，折线表示该年份中各国家的均值。
        """
    )
    return


@app.cell
def __():
    # 加载示例数据集
    from vega_datasets import data

    cars = data.cars()

    import altair as alt

    points = (
        alt.Chart(cars)
        .mark_point()
        .encode(x="Year:T", y="Miles_per_Gallon", color="Origin")
        .properties(width=800)
    )

    lines = (
        alt.Chart(cars)
        .mark_line()
        .encode(x="Year:T", y="mean(Miles_per_Gallon)", color="Origin")
        .properties(width=800)
        .interactive(bind_y=False)
    )

    points + lines
    return alt, cars, data, lines, points


@app.cell
def __():
    import marimo as mo
    return mo,


if __name__ == "__main__":
    app.run()

