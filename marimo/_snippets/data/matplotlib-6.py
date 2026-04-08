# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Matplotlib：带色图的热力图

        使用 `imshow()` 和自定义色图创建热力图。
        常用于可视化矩阵、相关性和网格数据。
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
    def create_heatmap():
        # 创建示例相关矩阵
        np.random.seed(42)
        data = np.random.randn(5, 5)
        corr = np.corrcoef(data)

        # 创建热力图
        fig, ax = plt.subplots(figsize=(7, 6))
        im = ax.imshow(corr, cmap='coolwarm', vmin=-1, vmax=1)

        # 添加颜色条
        plt.colorbar(im)

        # 添加标签
        ax.set_xticks(range(5))
        ax.set_yticks(range(5))
        ax.set_title('Correlation Matrix')

        return ax

    create_heatmap()
    return (create_heatmap,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

