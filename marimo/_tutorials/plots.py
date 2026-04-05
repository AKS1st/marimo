# Copyright 2026 Marimo. All rights reserved.
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "marimo",
#     "matplotlib==3.10.1",
#     "numpy==2.2.4",
# ]
# ///

import marimo

__generated_with = "0.19.11"
app = marimo.App()


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    # 绘图
    """)
    return


@app.cell(hide_code=True)
def _(check_dependencies):
    check_dependencies()
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    marimo 支持多种流行的绘图库，包括 matplotlib、
    plotly、seaborn 和 altair。

    这个教程使用 matplotlib 举例；其他库的用法也类似。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## Matplotlib
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    要显示图表，只需把它放到单元格的最后一个表达式里（和其他输出一样）。

    ```python3
    # 在单元格最后一行创建图表
    import matplotlib.pyplot as plt
    plt.plot([1, 2])
    ```
    """)
    return


@app.cell
def _(plt):
    plt.plot([1, 2])
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ```python3
    # 创建图表
    plt.plot([1, 2])
    # ... 做些别的事情 ...
    # 让 plt.gca() 成为单元格最后一行
    plt.gca()
    ```
    """)
    return


@app.cell
def _(plt):
    plt.plot([1, 2])
    # ... do some work ...
    # make plt.gca() the last line of the cell
    plt.gca()
    return


@app.cell(hide_code=True)
def _(mo, plt_show_explainer):
    mo.accordion(plt_show_explainer)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    **每个单元格都是新图形。** 对于命令式的 `pyplot` API，
    每个单元格开始时都会有一个空图形。
    """)
    return


@app.cell
def _(np):
    x = np.linspace(start=-4, stop=4, num=100, dtype=float)
    return (x,)


@app.cell
def _(plt, x):
    plt.plot(x, x)
    plt.plot(x, x**2)
    plt.gca()
    return


@app.cell
def _(plt, x):
    plt.plot(x, x**3)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    要跨多个单元格构建图形，可以使用面向对象的 API 并创建自己的坐标轴：
    """)
    return


@app.cell
def _(plt, x):
    _, axis = plt.subplots()
    axis.plot(x, x)
    axis.plot(x, x**2)
    axis
    return (axis,)


@app.cell
def _(axis, x):
    axis.plot(x, x**3)
    axis
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### 交互式绘图

    通过 UI 元素为图表参数化，就能交互式绘图。
    """)
    return


@app.cell
def _(mo):
    exponent = mo.ui.slider(1, 5, value=1, step=1, label='指数')

    mo.md(
        f"""
        **幂函数可视化。**

        {exponent}
        """
    )
    return (exponent,)


@app.cell
def _(mo, plt, x):
    @mo.cache
    def plot_power(exponent):
        plt.plot(x, x**exponent)
        return plt.gca()

    return (plot_power,)


@app.cell
def _(exponent, mo, plot_power):
    _tex = (
        f"$$f(x) = x^{exponent.value}$$" if exponent.value > 1 else "$$f(x) = x$$"
    )

    mo.md(
        f"""

        {_tex}

        {mo.as_html(plot_power(exponent.value))}
        """
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### 使用 `mo.ui.matplotlib` 的响应式选择

    把 matplotlib 的 `Axes` 包装进 `mo.ui.matplotlib`，就能让用户通过框选（点击拖拽）
    或套索选择（按住 Shift 拖拽）来选择数据。使用 `fig.value.get_mask(x, y)`
    可以获取所选点的布尔掩码。
    """)
    return


@app.cell
def _(mo, np, plt):
    XY = np.random.randn(1000, 1000)
    plt.scatter(XY[:, 0], XY[:, 1], s=1)
    scatter_fig = mo.ui.matplotlib(plt.gca())
    scatter_fig
    return XY, scatter_fig


@app.cell
def _(XY, scatter_fig):
    _mask = scatter_fig.value.get_mask(XY[:, 0], XY[:, 1])
    XY[_mask]
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 其他库
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    marimo 也支持这些其他绘图库：

    - Plotly
    - Seaborn
    - Altair

    只需把它们的图形对象作为单元格的最后一个表达式输出，
    或者用 `mo.as_html` 嵌入到 markdown 中即可。

    如果你希望 marimo 集成其他库，欢迎联系我们。
    """)
    return


@app.cell(hide_code=True)
def _(missing_packages, mo):
    module_not_found_explainer = mo.md(
        """
        ## 糟糕！

        看起来你缺少这个教程所需的一个包。

        使用左侧的软件包管理面板安装 **numpy** 和 **matplotlib**，
        然后重启教程。

        或者，如果你使用 `uv`，可以这样打开教程：

        ```
        uvx marimo tutorial plots
        ```

        在命令行中。
        """
    ).callout(kind='warn')

    def check_dependencies():
        if missing_packages:
            return module_not_found_explainer

    return (check_dependencies,)


@app.cell(hide_code=True)
def _():
    plt_show_explainer = {
        "使用 `plt.show()`": """
        你可以使用 `plt.show()` 或 `figure.show()` 在单元格的控制台区域中显示图表。
        请注意，控制台输出不会显示在应用视图中。
        """
    }
    return (plt_show_explainer,)


@app.cell
def _():
    try:
        import matplotlib
        import matplotlib.pyplot as plt
        import numpy as np
        missing_packages = False
    except ModuleNotFoundError:
        missing_packages = True

    if not missing_packages:
        matplotlib.rcParams['figure.figsize'] = (6, 2.4)
    return missing_packages, np, plt


@app.cell
def _():
    import marimo as mo

    return (mo,)


if __name__ == "__main__":
    app.run()
