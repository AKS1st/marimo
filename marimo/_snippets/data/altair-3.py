# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.3.9"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # 可视化：Altair 堆叠直方图

        If you take a standard histogram and encode another field with color, the result will be a stacked histogram:

        """
    )
    return


@app.cell
def __():
    # 加载示例数据集
    from vega_datasets import data

    cars = data.cars()

    # 绘制数据集，并引用 DataFrame 列名
    import altair as alt

    alt.Chart(cars).mark_bar().encode(
        x=alt.X("Miles_per_Gallon", bin=True), y="count()", color="Origin"
    )
    return alt, cars, data


@app.cell
def __():
    import marimo as mo
    return mo,


if __name__ == "__main__":
    app.run()

