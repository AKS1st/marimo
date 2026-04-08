# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Matplotlib：多子图布局

        使用 `plt.subplots()` 创建多个子图。
        常用于通过 `sharex` 和 `sharey` 选项比较数据的不同视图。
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
    def create_multi_subplot():
        # 生成示例数据
        x = np.linspace(0, 10, 100)
        y1 = np.sin(x)
        y2 = np.exp(-x/3)

        # 创建 2x2 子图布局
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 8))

        # 绘制不同的可视化
        ax1.plot(x, y1, 'b-', label='Sine')
        ax1.set_title('折线图')
        ax1.legend()

        ax2.scatter(x[::5], y2[::5], c='r', s=50, alpha=0.5)
        ax2.set_title('散点图')

        ax3.fill_between(x, y1, alpha=0.3)
        ax3.set_title('面积图')

        ax4.hist(y2, bins=20, alpha=0.7)
        ax4.set_title('Histogram')

        # Adjust layout
        plt.tight_layout()

        return ax1, ax2, ax3, ax4

    create_multi_subplot()
    return (create_multi_subplot,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

