# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Matplotlib：双 Y 轴可视化

        使用 `twinx()` 创建具有两个不同 y 轴尺度的图表。
        常用于在同一 x 轴上比较不同指标。
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
    def create_twin_axes():
        # 生成示例数据
        x = np.linspace(0, 10, 100)
        y1 = np.sin(x) * 10  # Large scale
        y2 = np.cos(x) * 0.1  # Small scale

        # 创建图形和坐标轴
        fig, ax1 = plt.subplots(figsize=(8, 5))

        # 在主 y 轴上绘图
        color = 'tab:blue'
        ax1.set_xlabel('Time')
        ax1.set_ylabel('Large Scale', color=color)
        ax1.plot(x, y1, color=color)
        ax1.tick_params(axis='y', labelcolor=color)

        # 创建双 y 轴
        ax2 = ax1.twinx()
        color = 'tab:red'
        ax2.set_ylabel('Small Scale', color=color)
        ax2.plot(x, y2, color=color)
        ax2.tick_params(axis='y', labelcolor=color)

        return ax1, ax2

    create_twin_axes()
    return (create_twin_axes,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

