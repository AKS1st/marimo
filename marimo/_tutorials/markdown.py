# Copyright 2026 Marimo. All rights reserved.
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "marimo",
#     "matplotlib==3.10.1",
#     "numpy==2.2.4",
#     "polars==1.26.0",
# ]
# ///

import marimo

__generated_with = "0.19.7"
app = marimo.App()


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    # 你好，Markdown！

    使用 marimo 的 "`md`" 函数来编写 markdown。这个函数会把 Markdown 编译成 marimo 可以显示的 HTML。

    例如，下面是渲染上面标题和段落的代码：

    ```python3
    mo.md(
        '''
        # 你好，Markdown！

        使用 marimo 的 "`md`" 函数把富文本嵌入到 marimo 应用中。
        这个函数会把你的 Markdown 编译成 marimo 可以显示的 HTML。
        '''
    )
    ```
    """)
    return


@app.cell
def _(mo):
    mo.md(r"""
    **提示：在 Markdown 和 Python 编辑器之间切换**

    虽然 markdown 是用 `mo.md` 写的，但对于只包含 `mo.md(...)` 的单元格，marimo 提供了 markdown 编辑器来隐藏这些样板代码。

    你可以通过点击编辑器右上角的蓝色图标、按 `Ctrl/Cmd+Shift+M`，或使用“单元格操作菜单”在 Markdown 和 Python 编辑器之间切换。
    你也可以通过单元格操作菜单**隐藏** markdown 编辑器。

    **提示：** 要把 Python 值插入 markdown 字符串，你需要使用 Python 的 f-string；可以在 markdown 编辑器右下角勾选 `f`，或者在 Python 视图里使用 `mo.md(f"...")`。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## LaTeX
    你可以在 Markdown 中嵌入 LaTeX。

    For example,

    ```python3
    mo.md(r'$f : \mathbf{R} \to \mathbf{R}$')
    ```

    会渲染为 $f : \mathbf{R} \to \mathbf{R}$，而

    ```python3
    mo.md(
        r'''
        \[
        f: \mathbf{R} \to \mathbf{R}
        \]
        '''
    )
    ```

    会渲染为展示数学公式

    \[
    f: \mathbf{R} \to \mathbf{R}.
    \]
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "提示：`r''` 字符串": mo.md(
                "在编写 LaTeX 时，使用 `r''` 字符串可以避免转义反斜杠。"
            )
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "Note: KaTeX": mo.md(
                """
                marimo 实际上使用 KaTeX，这是一款用于网页的数学排版库，支持 LaTeX 的一个子集。
                支持与不支持的命令列表请见
                https://katex.org/docs/support_table
                """
            )
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 插值 Python 值

    你可以使用 `f-string` 和 marimo 的 `as_html` 函数把 Python 值插入 markdown。
    这让你能够创建内容依赖于运行时变化数据的 markdown。

    下面是一些示例。
    """)
    return


@app.cell
def _(mo, np, plt):
    def _sine_plot():
        _x = np.linspace(start=0, stop=2 * np.pi)
        plt.plot(_x, np.sin(_x))
        return plt.gca()


    mo.md(
        f"""
        ### 图表
        一个 matplotlib 图形：

        ```python3
        _x = np.linspace(start=0, stop=2*np.pi)
        sine_plot = plt.plot(_x, np.sin(_x))
        mo.md(f"{{mo.as_html(sine_plot)}}")
        ```
        会得到

        {mo.as_html(_sine_plot())}
        """
    )
    return


@app.cell
def _(mo):
    leaves = mo.ui.slider(1, 32, label="🍃: ")

    mo.md(
        f"""
        ### UI 元素

        一个 `marimo.ui` 对象：

        ```python3
        leaves = mo.ui.slider(1, 16, label="🍃: ")
        mo.md(f"{{leaves}}")
        ```

        会得到

        {leaves}
        """
    )
    return (leaves,)


@app.cell
def _(leaves, mo):
    mo.md(f"""你的叶子：{"🍃" * leaves.value}""")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "提示：UI 元素会自行排版": """
            marimo 对象知道如何自行排版，所以你可以省略 `as_html` 调用。
            """
        }
    )
    return


@app.cell
def _(mo, np):
    import polars as pl


    def make_dataframe():
        x = np.linspace(0, 2 * np.pi, 10)
        y = np.sin(x)
        return pl.DataFrame({"x": x, "sin(x)": y})


    mo.md(
        f"""
        ### 其他对象

        使用 `mo.as_html` 可以把对象转换为 HTML。这个函数
        可以为许多 Python 类型生成丰富的 HTML，包括：

        - lists, dicts, and tuples,
        - `pandas` and `polars` dataframes and series,
        - `seaborn` figures,
        - `plotly` figures, and
        - `altair` figures.

        例如，这里是一个 Polars dataframe：

        {mo.as_html(make_dataframe())}
        """
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "提示：输出会自动转换为 HTML": """
            `mo.as_html` 只在把对象插入 markdown 时才需要；
            单元格的最后一个表达式（它的输出）会自动转换为 HTML。
            """
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 综合示例

    下面是一个更有意思的例子，把我们学到的内容都组合起来：
    渲染依赖 Python 对象值的 Markdown 和 LaTeX。
    """)
    return


@app.cell
def _(math, mo):
    amplitude = mo.ui.slider(1, 2, step=0.1, label="振幅：")
    period = mo.ui.slider(
        math.pi / 4,
        4 * math.pi,
        value=2 * math.pi,
        step=math.pi / 8,
        label="周期：",
    )
    return amplitude, period


@app.cell
def _(mo, np, plt):
    @mo.cache
    def plotsin(amplitude, period):
        x = np.linspace(0, 2 * np.pi, 256)
        plt.plot(x, amplitude * np.sin(2 * np.pi / period * x))
        plt.ylim(-2.2, 2.2)
        return plt.gca()

    return (plotsin,)


@app.cell
def _(amplitude, mo, period):
    mo.md(
        f"""
        **正弦曲线。**

    - {amplitude}
    - {period}
    """
    )
    return


@app.cell
def _(amplitude, mo, period, plotsin):
    mo.md(
        rf"""
    你正在查看下面这个图：

    \[
    f(x) = {amplitude.value}\sin((2\pi/{period.value:0.2f})x),
    \]

    其中 $x$ 的范围是从 $0$ 到 $2\pi$。
    {mo.as_html(plotsin(amplitude.value, period.value))}
    """
    )
    return


@app.cell(hide_code=True)
def _():
    import matplotlib.pyplot as plt
    import numpy as np

    return np, plt


@app.cell(hide_code=True)
def _():
    import math

    import marimo as mo

    return math, mo


if __name__ == "__main__":
    app.run()
