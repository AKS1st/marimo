# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Matplotlib：误差棒

        使用 `errorbar()` 添加误差棒。
        常用于科学可视化中展示测量不确定性或数据波动。
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
    def create_error_bar_plot():
        # 创建带误差的示例数据
        x = np.linspace(0, 10, 5)
        y = np.exp(-x/2)
        y_err = 0.1 + 0.1*np.random.rand(len(x))

        # 创建误差棒图
        fig, ax = plt.subplots(figsize=(8, 5))
        ax.errorbar(x, y, yerr=y_err, fmt='o-', capsize=5,
                   ecolor='gray', markersize=8)

        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.grid(True, linestyle='--', alpha=0.7)

        return ax

    create_error_bar_plot()
    return (create_error_bar_plot,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

