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

__generated_with = "0.19.7"
app = marimo.App()


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    # marimo notebook 如何运行

    响应式执行只基于一条规则：当某个单元格运行时，所有引用了它定义的任意全局变量的其他单元格都会自动运行。

    为了实现响应式执行，marimo 会把你的单元格构造成一个数据流图。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    **提示：关闭自动执行。**

    marimo 允许你关闭自动执行：在 notebook
    底部，把 "On Cell Change" 改成 "lazy"。

    在 lazy 运行时，运行一个单元格后，marimo 会把其后代标记为过期，而不是自动运行它们。
    lazy 运行时让你掌控单元格何时执行，同时仍然保证 notebook 状态正确。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 引用与定义

    marimo notebook 是一个有向无环图，其中节点表示单元格，边表示数据依赖。marimo 会通过分析每个单元格（不执行它）来确定：

    - 引用（`refs`），即它读取但不定义的全局变量；
    - 定义（`defs`），即它定义的全局变量。

    如果后一个单元格引用了前一个单元格定义的任意全局变量，那么前后两个单元格之间就有一条边。

    响应式执行规则也可以用图来描述：当一个单元格运行时，它的后代会自动运行。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### 示例

    接下来的四个单元格会绘制一个给定周期和振幅的正弦波。
    每个单元格都标注了它的 refs 和 defs。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "提示：检查 refs 和 defs": f"""
            使用 `mo.refs()` 和 `mo.defs()` 可以查看任意给定单元格的 refs 和 defs。
            这有助于调试复杂 notebook。

            例如，这是当前这个单元格的 refs 和 defs：

            {mo.as_html({"refs": mo.refs(), "defs": mo.defs()})}
            """
        }
    )
    return


@app.cell
def _(amplitude, mo, period, plot_wave):
    mo.md(f"""
        {mo.as_html(plot_wave(amplitude, period))}

        - `refs: {mo.refs()}`
        - `defs: {mo.defs()}`
        """)
    return


@app.cell
def _(mo):
    period = 2 * 3.14159

    mo.md(
        f"""
        - `refs: {mo.refs()}`
        - `defs: {mo.defs()}`
        """
    )
    return (period,)


@app.cell
def _(mo):
    amplitude = 1

    mo.md(
        f"""
        - `refs: {mo.refs()}`
        - `defs: {mo.defs()}`
        """
    )
    return (amplitude,)


@app.cell
def _(mo, np, plt):
    def plot_wave(amplitude, period):
        x = np.linspace(0, 2 * np.pi, 256)
        plt.plot(x, amplitude * np.sin(2 * np.pi / period * x))
        plt.xlim(0, 2 * np.pi)
        plt.ylim(-2, 2)
        plt.xticks(
            [0, np.pi / 2, np.pi, 3 * np.pi / 2, 2 * np.pi],
            [0, r"$\pi/2$", r"$\pi$", r"$3\pi/2$", r"$2\pi$"],
        )
        plt.yticks([-2, -1, 0, 1, 2])
        plt.gcf().set_size_inches(6.5, 2.4)
        return plt.gca()

    mo.md(
        f"""
        - `refs: {mo.refs()}`
        - `defs: {mo.defs()}`
        """
    )
    return (plot_wave,)


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    🌊 **试试看！** 在上面的单元格中，试着修改 `period` 或 `amplitude` 的值，
    然后点击运行按钮（ ▷ ）来应用更改。
    看看正弦波会发生什么变化。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    下面是生成正弦波图的单元格，以及导入库的单元格构成的数据流图。每个单元格都标注了它的 defs。

    ```
                       +------+               +-----------+
           +-----------| {mo} |-----------+   | {np, plt} |
           |           +---+--+           |   +----+------+
           |               |              |        |
           |               |              |        |
           v               v              v        v
      +----------+   +-------------+   +--+----------+
      | {period} |   | {amplitude} |   | {plot_wave} |
      +---+------+   +-----+-------+   +------+------+
          |                |                  |
          |                v                  |
          |              +----+               |
          +------------> | {} | <-------------+
                         +----+
    ```

    最后一个不定义任何内容的单元格会生成图表。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 数据流编程

    marimo 的运行时规则会带来一些重要后果；如果你不习惯数据流编程，这些后果可能会让你感到意外。下面列出这些特性。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### 执行顺序不等于单元格顺序

    单元格的执行顺序完全由数据流图决定。这让 marimo notebook 比传统 notebook 更具可复现性。
    它也让你可以把样板代码，比如导入或很长的 markdown 字符串，放到编辑器底部。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### 全局变量名必须唯一

    每个全局变量只能由一个单元格定义。没有这个约束，marimo 就无法知道单元格应该以什么顺序执行。

    如果你违反了这个约束，marimo 会给出一条有帮助的错误信息，如下所示：
    """)
    return


@app.cell
def _():
    planet = "Mars"
    planet
    return


@app.cell
def _():
    planet = "Earth"
    planet
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    **🌊 试试看！** 在前一个单元格中，把 `planet` 改名为 `home`，然后运行该单元格。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    因为 defs 必须唯一，所以全局变量不能在创建它们的单元格之外，使用 `+=` 或 `-=` 这样的操作符进行修改；
    这些操作符会被视为对名称的重新定义。

    **🌊 试试看！** 把下面两个单元格合并成一个，消除接下来的错误。
    """)
    return


@app.cell
def _():
    count = 0
    return


@app.cell
def _():
    count += 1
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### 以下划线开头的变量对单元格是局部的

    以下划线开头的全局变量对定义它们的单元格来说是“私有”的。
    这意味着多个单元格可以定义同名的以下划线开头变量，而且某个单元格的私有变量不会暴露给其他单元格。

    **示例**。
    """)
    return


@app.cell
def _():
    _private_variable, _ = 1, 2
    _private_variable, _
    return


@app.cell
def _():
    _private_variable, _ = 3, 4
    _private_variable, _
    return


@app.cell
def _():
    # `_private_variable` and `_` are not defined in this cell
    _private_variable, _
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### 删除单元格会删除它的变量

    删除单元格会删除它的全局变量，然后运行所有引用这些变量的单元格。
    这样可以防止一种严重 bug：编辑器里删掉了状态，但程序内存里还保留着它。
    """)
    return


@app.cell
def _(mo):
    to_be_deleted = "变量仍然存在"

    mo.md(
        """
        🌊 **试试看！**

        点击垃圾桶图标删除这个单元格。
        """
    )
    return (to_be_deleted,)


@app.cell
def _(to_be_deleted):
    to_be_deleted
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### 不允许循环

    单元格之间不允许出现循环。例如：
    """)
    return


@app.cell
def _(two):
    one = two - 1
    return (one,)


@app.cell
def _(one):
    two = one + 1
    return (two,)


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### marimo 不跟踪属性

    marimo 只跟踪全局变量。写对象属性不会触发响应式执行。

    **🌊 示例。** 在下一个单元格中修改 `state.number` 的值，然后运行该单元格。
    注意，后续单元格不会更新。
    """)
    return


@app.cell
def _(state):
    state.number = 1
    return


@app.cell
def _(state):
    state.number
    return


@app.cell
def _():
    class namespace:
        pass

    state = namespace()
    state.number = 0
    return (state,)


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "为什么不跟踪属性？": """
            marimo 无法可靠地把属性追踪到定义它们的单元格。
            例如，属性常常会被库代码创建或修改。
            """
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### marimo 不跟踪变异

    在 Python 中，不运行代码就无法知道它是否会修改对象。
    因此，变异操作（例如向列表追加元素）不会触发响应式执行。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "提示（高级）：可变状态": (
                """
            你可以利用 marimo 不跟踪属性或变异这一事实，在 marimo 中实现可变状态。
            `ui` 教程中展示了一个示例。
            """
            )
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 最佳实践

    marimo 对 notebook 的约束，都是其程序是有向无环图这一事实的自然结果。
    只要记住这一点，你很快就能适应 marimo 的 notebook 编写方式。

    最终，这些约束会帮助你创建强大的 notebook 和应用，同时鼓励你编写干净、可复现的代码。

    遵循以下建议，保持 marimo 的写法：
    """)
    return


@app.cell
def _(mo, tips):
    mo.accordion(tips)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 接下来做什么？

    查看交互性教程，了解 UI 元素：

    ```
    marimo tutorial ui
    ```
    """)
    return


@app.cell
def _():
    import matplotlib.pyplot as plt
    import numpy as np

    return np, plt


@app.cell(hide_code=True)
def _():
    tips = {
        "谨慎使用全局变量": (
            """
            尽量减少程序中的全局变量数量，以避免单元格之间的名称冲突。
            同时也要让单个单元格定义的全局变量数量保持较少，这样响应式执行的基本单位就会更小。
            """
        ),
        "使用描述性名称": (
            """
            使用有描述性的变量名，尤其是全局变量。
            这有助于减少命名冲突，也会让代码更好。
            """
        ),
        "使用函数": (
            """
            把逻辑封装到函数中，避免用临时变量或中间变量污染全局命名空间。
            """
        ),
        "尽量减少变异": (
            """
            我们前面看到，marimo 无法跟踪对象变异。所以尽量只在创建对象的单元格中修改它，
            或者创建新对象，而不是修改已有对象。

            例如，不要这样做：

            ```python3
            # 一个单元格
            numbers = [1, 2, 3]
            ```

            ```python3
            # 另一个单元格
            numbers.append(4)
            ```

            更推荐：

            ```python3
            # 一个单元格
            numbers = [1, 2, 3]
            numbers.append(4)
            ```

            或者：

            ```python3
            # 一个单元格
            numbers = [1, 2, 3]
            ```

            ```python3
            # 另一个单元格
            more_numbers = numbers + [4]
            ```
            """
        ),
        "编写幂等单元格": (
            """
            编写在给定相同输入（refs）时，输出和行为都相同的单元格；这样的单元格称为_幂等_。
            这会帮助你避免 bug，并让你缓存昂贵的中间计算（见下一条建议）。
            """
        ),
        "使用 `@mo.cache` 缓存中间计算": (
            """
            使用 `mo.cache` 缓存昂贵函数的返回值。
            如果你按照前面的建议把复杂逻辑抽象成幂等函数，就可以这样做。

            例如：

            ```python3
            import marimo as mo

            @mo.cache
            def compute_prediction(problem_parameters):
              ...
            ```

            每当 `compute_predictions` 用一个它没见过的 `problem_parameters` 值调用时，
            它会计算预测并将结果存入缓存。下次用相同参数调用时，它不会重新计算，而是直接从缓存中取出之前的结果。

            如果你熟悉 `functools.cache`，那么 `mo.cache` 类似，但更稳健，
            即使定义该函数的单元格被重新运行，缓存也会保留。
            """
        ),
    }
    return (tips,)


@app.cell
def _():
    import marimo as mo

    return (mo,)


if __name__ == "__main__":
    app.run()
