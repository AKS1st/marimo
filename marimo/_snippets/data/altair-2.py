# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.3.9"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # 可视化：Altair 直方图

        Altair 提供了多种聚合操作，用于构建自定义直方图。下面是一个简单示例。
        
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
        x=alt.X("Miles_per_Gallon", bin=True),
        y="count()",
    )
    return alt, cars, data


@app.cell
def __():
    import marimo as mo
    return mo,


if __name__ == "__main__":
    app.run()

