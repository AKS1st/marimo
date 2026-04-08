# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.3.9"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # 可视化：Altair 交互式散点图

        Altair 可以轻松地从存储在 Pandas DataFrame 中的数据创建交互式散点图。
        """
    )
    return


@app.cell
def __():
    # 加载一个示例数据集
    from vega_datasets import data

    cars = data.cars()

    # 绘制数据集，并引用 DataFrame 的列名
    import altair as alt

    (
        alt.Chart(cars)
        .mark_point()
        .encode(x="Horsepower", y="Miles_per_Gallon", color="Origin")
        .interactive()
    )
    return alt, cars, data


@app.cell
def __():
    import marimo as mo
    return mo,


if __name__ == "__main__":
    app.run()
