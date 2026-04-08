# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Matplotlib：基础折线图与散点图

        使用 `plt.plot()` 和 `plt.scatter()` 创建基础图表。示例展示了
        多条序列的线型、标记和颜色，以及 `plt.legend()` 的用法。
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
    def create_line_scatter_plot():
        # 生成示例数据
        x = np.linspace(0, 10, 100)
        y1 = np.sin(x)
        y2 = np.cos(x)

        # 创建图像和坐标轴
        fig, ax = plt.subplots(figsize=(10, 6))

        # 绘制不同样式的多条曲线
        ax.plot(x, y1, 'b-', label='sin(x)', linewidth=2)
        ax.scatter(x[::10], y2[::10], c='r', label='cos(x)', s=50)

        # 自定义图表
        ax.set_xlabel('x')
        ax.set_ylabel('y')
        ax.set_title('基础折线图与散点图')
        ax.grid(True, linestyle='--', alpha=0.7)
        ax.legend()

        return ax

    create_line_scatter_plot()
    return (create_line_scatter_plot,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
