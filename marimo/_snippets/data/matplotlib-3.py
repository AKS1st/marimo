# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # Matplotlib：带自定义格式的时间序列图

        使用 `plot_date()` 和自定义日期格式创建时间序列可视化。
        同时展示使用 `fill_between()` 绘制的移动平均和置信区间。
        """
    )
    return


@app.cell
def _():
    import matplotlib.pyplot as plt
    import numpy as np
    import pandas as pd
    return np, pd, plt


@app.cell
def _(np, pd, plt):
    def create_time_series_plot():
        # 生成示例时间序列数据
        dates = pd.date_range(start='2023-01-01', periods=100, freq='D')
        np.random.seed(42)
        values = np.random.randn(100).cumsum()

        # 计算滚动统计量
        window = 20
        rolling_mean = pd.Series(values).rolling(window=window).mean()
        rolling_std = pd.Series(values).rolling(window=window).std()

        # 创建图表
        fig, ax = plt.subplots(figsize=(12, 6))

        # 绘制原始数据和滚动平均
        ax.plot(dates, values, 'k-', alpha=0.3, label='Raw Data')
        ax.plot(dates, rolling_mean, 'b-', label=f'{window}-Day Mean')

        # 添加置信区间
        ax.fill_between(dates,
                       rolling_mean - 2*rolling_std,
                       rolling_mean + 2*rolling_std,
                       color='b', alpha=0.1, label='95% Confidence')

        # 自定义图表
        ax.set_title('Time Series with Rolling Statistics')
        ax.set_xlabel('Date')
        ax.set_ylabel('Value')
        ax.grid(True, linestyle='--', alpha=0.7)
        ax.legend()

        # Format date axis
        plt.gcf().autofmt_xdate()

        return ax

    create_time_series_plot()
    return (create_time_series_plot,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

