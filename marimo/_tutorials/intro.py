# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.19.2"
app = marimo.App()


@app.cell
def _():
    import marimo as mo

    mo.md("# 欢迎使用 marimo！🌊🍃")
    return (mo,)


@app.cell
def _(mo):
    slider = mo.ui.slider(1, 22)
    return (slider,)


@app.cell
def _(mo, slider):
    mo.md(f"""
    marimo 是一个**响应式** Python notebook。

    这意味着，与传统 notebook 不同，marimo notebook 在你修改它们或
    与 UI 元素交互时会**自动运行**，比如这个滑块：{slider}。

    {"##" + "🍃" * slider.value}
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "提示：关闭自动执行": mo.md(
                rf"""
            marimo 允许你关闭自动执行：在 notebook
            底部，把 "On Cell Change" 改成 "lazy"。

            在 lazy 运行时，运行一个单元格后，marimo 会把其后代标记为过期，
            而不是自动运行它们。lazy 运行时既让你掌控单元格何时执行，
            又能保证 notebook 状态的正确性。
            """
            )
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        """
        提示：这是一个教程 notebook。你可以在命令行输入 `marimo edit`
        来创建你自己的 notebook。
        """
    ).callout()
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 1. 响应式执行

    marimo notebook 由称为单元格的 Python 代码小块组成。

    marimo 会读取你的单元格并建模它们之间的依赖关系：只要某个定义了全局变量的
    单元格被运行，marimo 就会**自动运行**所有引用该变量的单元格。

    响应性让程序状态和输出与你的代码保持同步，
    构建出一个能在问题发生前就阻止 bug 的动态编程环境。
    """)
    return


@app.cell(hide_code=True)
def _(changed, mo):
    (
        mo.md(
            f"""
            **✨ 很好！** `changed` 的值现在是 {changed}。

            当你更新变量 `changed` 的值时，marimo
            **响应** 了这一变化并自动运行了这个单元格，因为它引用了全局变量 `changed`。

            响应性确保你的 notebook 状态始终一致，这对科学工作尤为重要；
            这也是 marimo notebook 能同时充当工具和应用的原因。
            """
        )
        if changed
        else mo.md(
            """
            **🌊 看看它怎么工作。** 在下一个单元格中，把变量 `changed`
            的值改成 `True`，然后点击运行按钮。
            """
        )
    )
    return


@app.cell
def _():
    changed = False
    return (changed,)


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "提示：执行顺序": (
                """
                页面上单元格的排列顺序并不影响它们的执行顺序：marimo 知道读取变量的单元格
                必须在定义该变量的单元格之后运行。这让你可以按最适合自己的方式组织代码。
                """
            )
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    **全局名称必须唯一。** 为了实现响应性，marimo 对单元格中的名称有一个约束：
    不能有两个单元格定义同一个变量。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "提示：封装": (
                """
                通过把逻辑封装到函数、类或 Python 模块中，你可以尽量减少 notebook 中的全局变量数量。
                """
            )
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "提示：私有变量": (
                """
                以下划线开头的变量对单元格来说是“私有”的，因此可以由多个单元格定义。
                """
            )
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 2. UI 元素

    单元格可以输出交互式 UI 元素。与 UI 元素交互会**自动触发 notebook 执行**：
    当你与 UI 元素交互时，它的值会被传回 Python，所有引用该元素的单元格都会重新运行。

    marimo 在 `marimo.ui` 下提供了一个可选的 UI 元素库。
    """)
    return


@app.cell
def _(mo):
    mo.md("""
    **🌊 一些 UI 元素。** 试着和下面的元素交互。
    """)
    return


@app.cell
def _(mo):
    icon = mo.ui.dropdown(["🍃", "🌊", "✨"], value="🍃")
    return (icon,)


@app.cell
def _(icon, mo):
    repetitions = mo.ui.slider(1, 16, label=f"{icon.value} 的数量：")
    return (repetitions,)


@app.cell
def _(icon, repetitions):
    icon, repetitions
    return


@app.cell
def _(icon, mo, repetitions):
    mo.md("# " + icon.value * repetitions.value)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 3. marimo 就是 Python

    marimo 单元格只解析 Python（而且只解析 Python），marimo notebook 以纯 Python 文件形式保存——
    不包含输出。这里没有什么魔法语法。

    marimo 生成的 Python 文件：

    - 可以轻松用 git 管理，diff 很小
    - 人和机器都容易阅读
    - 可以用你选择的工具格式化
    - 可以作为 Python 脚本使用，UI 元素会采用默认值
    - 可以被其他模块导入（以后会进一步讲）
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 4. 将 notebook 作为应用运行

    marimo notebook 也可以作为应用使用。点击右下角的应用窗口图标，
    就能在“应用视图”中查看这个 notebook。

    你可以在命令行使用 `marimo run` 将 notebook 作为应用提供服务。
    当然，你也完全可以只把 marimo 当作更强大的 notebook 工具，而不去做应用。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 5. `marimo` 命令行工具

    **创建和编辑 notebook。** 使用

    ```
    marimo edit
    ```

    在终端中启动 marimo notebook 服务。从这里
    你可以创建新 notebook 或编辑现有 notebook。


    **作为应用运行。** 使用

    ```
    marimo run notebook.py
    ```

    启动一个 Web 服务，以只读模式把 notebook 作为应用提供，
    并隐藏代码单元格。

    **转换 Jupyter notebook。** 使用 `marimo convert` 将 Jupyter notebook 转换成 marimo notebook：

    ```
    marimo convert your_notebook.ipynb > your_app.py
    ```

    **教程。** marimo 随包提供了一些教程：

    - `dataflow`：更多关于 marimo 自动执行的内容
    - `ui`：如何使用 UI 元素
    - `markdown`：如何编写 markdown，以及插值值和 LaTeX
    - `plots`：marimo 中的绘图是如何工作的
    - `sql`：如何使用 SQL
    - `layout`：marimo 中的布局元素
    - `fileformat`：marimo 文件格式是如何工作的
    - `markdown-format`：如何在 marimo 中使用 `.md` 文件
    - `for-jupyter-users`：如果你来自 Jupyter

    使用 `marimo tutorial` 启动教程；例如：

    ```
    marimo tutorial dataflow
    ```

    除了教程之外，我们还在
    [GitHub 仓库](https://www.github.com/marimo-team/marimo/tree/main/examples) 中提供了示例。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 6. marimo 编辑器

    下面这些提示可以帮助你上手 marimo 编辑器。
    """)
    return


@app.cell
def _(mo, tips):
    mo.accordion(tips)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 最后，来个有趣的小知识
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    “marimo” 这个名字指的是一种藻类。在合适的条件下，它们会聚集成一个小球，
    这种球被称为“marimo moss ball”。这些由藻丝构成的可爱集合体，整体大于部分之和。
    """)
    return


@app.cell(hide_code=True)
def _():
    tips = {
        "保存": (
            """
            **保存**

            - 使用屏幕顶部的输入框，或按 `Ctrl/Cmd+s`，为你的应用命名。
              你也可以在命令行创建一个命名应用，例如 `marimo edit app_name.py`。

            - 点击右下角的保存图标，或按 `Ctrl/Cmd+s` 来保存。
              默认情况下，marimo 配置为自动保存。
            """
        ),
        "运行": (
            """
            1. 点击单元格右上角的播放（ ▷ ）按钮，或按 `Ctrl/Cmd+Enter` 来_运行单元格_。

            2. 点击单元格右侧的黄色运行按钮，或按 `Ctrl/Cmd+Enter` 来_运行过期单元格_。
               当代码被修改但还没运行时，单元格就会变成过期状态。

            3. 点击屏幕右下角的播放（ ▷ ）按钮，或按 `Ctrl/Cmd+Shift+r` 来_运行所有过期单元格_。
            """
        ),
        "控制台输出": (
            """
            控制台输出（例如 `print()` 语句）会显示在单元格下方。
            """
        ),
        "创建、移动和删除单元格": (
            """
            1. 将鼠标悬停在单元格上方后，点击左侧出现的加号按钮，即可在该单元格上方或下方_创建_新单元格。

            2. 将鼠标悬停在单元格上方后，拖动单元格右侧的把手，可将单元格_上移_或_下移_。

            3. 点击垃圾桶图标可_删除_单元格。
               你可以点击屏幕右下角的撤销按钮，或按 `Ctrl/Cmd+Shift+z` 恢复它。
            """
        ),
        "关闭自动执行": (
            """
            你可以通过 notebook 设置（齿轮图标）或底部面板关闭自动执行。
            在处理计算开销较大或包含数据库事务等副作用的 notebook 时，这很有用。
            """
        ),
        "禁用单元格": (
            """
            你可以通过单元格上下文菜单禁用单元格。
            marimo 永远不会运行被禁用的单元格，或者任何依赖它的单元格。
            这有助于在编辑 notebook 时避免意外执行昂贵计算。
            """
        ),
        "代码折叠": (
            """
            你可以点击左侧行号列中的箭头图标，或者使用键盘快捷键，来折叠单元格中的代码。

            使用命令面板（`Ctrl/Cmd+k`）或键盘快捷键，可以快速折叠或展开所有单元格。
            """
        ),
        "代码格式化": (
            """
            如果你安装了 [ruff](https://github.com/astral-sh/ruff)，
            可以使用快捷键 `Ctrl/Cmd+b` 格式化单元格。
            """
        ),
        "命令面板": (
            """
            使用 `Ctrl/Cmd+k` 打开命令面板。
            """
        ),
        "键盘快捷键": (
            """
            打开 notebook 菜单（右上角）或按 `Ctrl/Cmd+Shift+h`，即可查看所有键盘快捷键列表。
            """
        ),
        "配置": (
            """
           点击屏幕右上角附近的齿轮图标即可配置编辑器。
           """
        ),
        "退出与关闭": (
            """
           你可以点击屏幕右上角的圈 X 并按提示操作，退出 marimo 并关闭服务。

           :floppy_disk: _请先确保保存你的工作！_
            """
        ),
    }
    return (tips,)


if __name__ == "__main__":
    app.run()
