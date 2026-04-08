# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Matplotlib：样式与主题

        使用 `plt.style.use()` 应用自定义样式，并通过 `rcParams`
        定制图表。常用于创建适合发表的高质量图像。
        """
    )
    return


@app.cell
def _():
    import matplotlib.pyplot as plt
    import numpy as np
    return np, plt


@app.cell
def _(np, plt):
    def create_styled_plot():
        # 设置样式和自定义参数
        plt.style.use('ggplot')  # 使用内置 ggplot 样式
        plt.rcParams['figure.figsize'] = [8, 5]
        plt.rcParams['axes.grid'] = True

        # 生成示例数据
        x = np.linspace(0, 10, 50)
        y = np.sin(x) + np.random.normal(0, 0.2, 50)

        # 创建带样式的图表
        fig, ax = plt.subplots()
        ax.scatter(x, y, c='crimson', alpha=0.6)
        ax.set_title('带样式的散点图', fontsize=12, pad=10)

        # 添加最小化样式
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)

        return ax

    create_styled_plot()
    return (create_styled_plot,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
