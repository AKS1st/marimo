# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Matplotlib：图例自定义与样式

        Customize legend placement, styling, and handles.
        展示数据可视化中常见的图例模式。
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
    def create_advanced_legend():
        # 生成数据
        x = np.linspace(0, 10, 100)
        y1 = np.sin(x)
        y2 = np.cos(x)

        # 创建带自定义图例的图表
        fig, ax = plt.subplots(figsize=(8, 5))

        # 多种图表类型
        line1 = ax.plot(x, y1, 'b-', label='Sine')[0]
        scatter = ax.scatter(x[::10], y2[::10], c='r', label='Cosine')

        # Custom legend
        ax.legend(
            [line1, scatter],
            ['Sin(x)', 'Cos(x)'],
            loc='upper right',
            bbox_to_anchor=(1.15, 1),
            frameon=True,
            fancybox=True,
            shadow=True
        )

        return ax

    create_advanced_legend()
    return (create_advanced_legend,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

