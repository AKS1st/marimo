# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Matplotlib：数据点标签与说明注释

        使用 `annotate()` 添加注释，使用 `text()` 添加文本。
        常用于突出特定数据点并补充说明。
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
    def create_annotated_plot():
        # 创建数据
        x = np.linspace(0, 10, 20)
        y = np.sin(x)

        # 创建带注释的图表
        fig, ax = plt.subplots(figsize=(8, 5))
        ax.plot(x, y, 'b-')

        # 添加箭头注释
        ax.annotate('Maximum',
                    xy=(4.7, 1.0),        # Point to annotate
                    xytext=(5.5, 0.5),    # Text position
                    arrowprops=dict(facecolor='black', shrink=0.05))

        # 添加文本框
        ax.text(2, -0.5, 'Sine Wave',
                bbox=dict(facecolor='white', alpha=0.7))

        return ax

    create_annotated_plot()
    return (create_annotated_plot,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

