# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Matplotlib：3D 曲面图

        使用 `ax.plot_surface()` 创建 3D 曲面图。
        常用于可视化数学函数和地形数据。
        """
    )
    return


@app.cell
def _():
    import matplotlib.pyplot as plt
    import numpy as np
    from mpl_toolkits.mplot3d import Axes3D
    return Axes3D, np, plt


@app.cell
def _(np, plt):
    def create_3d_surface():
        # 为 3D 图创建数据
        x = np.linspace(-2, 2, 30)
        y = np.linspace(-2, 2, 30)
        X, Y = np.meshgrid(x, y)
        Z = np.sin(np.sqrt(X**2 + Y**2))

        # 创建 3D 图
        fig = plt.figure(figsize=(8, 6))
        ax = fig.add_subplot(111, projection='3d')
        surf = ax.plot_surface(X, Y, Z, cmap='viridis')

        # 添加颜色条
        fig.colorbar(surf)

        return ax

    create_3d_surface()
    return (create_3d_surface,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

