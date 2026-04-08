# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.3.9"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # 可视化：Altair 柱状图

        这展示了 Altair 中的一个简单柱状图，说明多个车型的平均每加仑英里数与产地之间的关系：
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
        x="mean(Miles_per_Gallon)", y="Origin", color="Origin"
    )
    return alt, cars, data


@app.cell
def __():
    import marimo as mo
    return mo,


if __name__ == "__main__":
    app.run()

