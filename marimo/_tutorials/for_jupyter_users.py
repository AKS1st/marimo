# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.19.7"
app = marimo.App(app_title="给 Jupyter 用户的 marimo 指南")


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # 给 Jupyter 用户的 marimo 指南

    这个 notebook 解释了 Jupyter 和 marimo 之间的重要区别。如果你熟悉 Jupyter，
    现在第一次尝试 marimo，请继续看下去！
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 响应式执行

    marimo 和 Jupyter 最大的区别就是 *响应式执行*。

    试着修改下一个单元格中 x 的值，然后运行它。
    """)
    return


@app.cell
def _():
    x = 0; x
    return (x,)


@app.cell
def _(x):
    y = x + 1; y
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    marimo 会对 `x` 的变化“做出响应”，并自动重新计算 `y`！

    **解释。** marimo 会读取单元格中的代码，并根据每个单元格声明和引用的变量，
    理解它们之间的依赖关系。当你执行一个单元格时，marimo 会自动执行所有依赖它的其他单元格，
    有点像电子表格。

    相比之下，Jupyter 需要你手动运行每个单元格。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### 为什么？

    响应式执行让你不必反复手动重跑单元格。

    它还确保代码和输出始终同步：

    - 你不用担心是不是忘了重跑某个单元格。
    - 当你删除一个单元格时，它的变量会自动从程序内存中移除，受影响的单元格也会自动失效。

    这让 marimo notebook 具有和普通 Python 脚本一样的可复现性。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 内置交互元素

    marimo 自带一个[庞大的 UI 元素库](https://docs.marimo.io/guides/interactivity.html)，它们会自动与 Python 同步。
    """)
    return


@app.cell
def _():
    import marimo as mo

    return (mo,)


@app.cell
def _(mo):
    slider = mo.ui.slider(start=1, stop=10, label="$x$")
    slider
    return (slider,)


@app.cell
def _(slider):
    slider.value
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(rf"""
    **解释。** marimo 既是 notebook 也是一个库。导入 `marimo as mo`，然后使用 `mo.ui` 就能访问强大的 UI 元素。

    赋给变量的 UI 元素会自动接入 marimo 的响应式执行模型：交互会自动触发引用它们的单元格执行。

    相比之下，Jupyter 缺乏响应性，这让 IPyWidgets 更难使用。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 可作为应用分享

    marimo notebook 可以作为只读 Web 应用分享：只需用下面命令运行它

    ```marimo run your_notebook.py```

    在命令行中。

    不是每个 marimo notebook 都必须作为应用分享，但如果你愿意，marimo 让这件事变得很自然。
    从这个意义上说，marimo 可以同时替代 Jupyter 和 Streamlit。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 单元格顺序

    在 marimo 中，单元格可以按任意顺序排列——marimo 会根据变量声明和引用，找出唯一正确的执行顺序（按 ["拓扑排序"](https://en.wikipedia.org/wiki/Topological_sorting#:~:text=In%20computer%20science%2C%20a%20topological,before%20v%20in%20the%20ordering.) 进行）。
    """)
    return


@app.cell
def _(z):
    z.value
    return


@app.cell
def _(mo):
    z = mo.ui.slider(1, 10, label="$z$"); z
    return (z,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    这样你就可以按最适合自己的方式排列单元格。比如，你可以把辅助函数和导入放到 notebook 底部，像附录一样。

    相比之下，Jupyter notebook 默认假定是自上而下的执行顺序。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 变量重新赋值

    marimo 不允许变量重新赋值。下面是 Jupyter notebook 中很常见、但在 marimo 中做不到的事情：
    """)
    return


@app.cell
def _():
    df = 0
    return (df,)


@app.cell
def _():
    df = 1
    return (df,)


@app.cell
def _(df):
    results = df.groupby(["my_column"]).sum()
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    **解释。** `results` 依赖于 `df`，但它应该使用哪个 `df` 值呢？响应性让这个问题无法得到合理答案，所以 marimo 不允许变量重新赋值。

    如果你遇到这个错误，可以选择：

    1. 把定义合并到一个单元格里
    2. 给变量加前缀下划线（`_df`），使其对单元格局部化
    3. 把代码封装进函数，或者给变量起更具描述性的名字
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(rf"""
    ## Markdown

    marimo notebook 以纯 Python 形式保存，但你仍然可以写 Markdown：
    导入 `marimo as mo` 并使用 `mo.md` 即可。

    /// details | 那 markdown 和 SQL “单元格” 呢？

    你可能会注意到 marimo UI 编辑器里有 markdown 和 SQL 单元格。这些只是更方便的写作入口，底层仍然使用 `mo.md` 和 `mo.sql`，但作者体验更好。
    ///
    """)
    return


@app.cell
def _(mo, slider):
    mo.md(
        f"""
        {slider} 的值是 {slider.value}。
        """
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    **解释。** 通过把 Markdown 提升到 Python 中，marimo 让你可以构造由任意 Python 元素参数化的动态 Markdown。marimo 知道如何渲染自己的元素，你也可以使用 `mo.as_html` 渲染其他对象，比如图表。

    _提示：在空单元格中按 `Cmd/Ctrl-Shift-M` 可以切换到 markdown 视图。_
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Notebook 文件

    Jupyter 会把 notebook 保存为 JSON 文件，并将输出序列化其中。这有助于记录图表和其他结果，但会让 notebook 难以版本管理和复用。

    ### marimo notebook 是 Python 脚本
    marimo notebook 以纯 Python 脚本形式保存。这让你可以用 git 管理它们、通过命令行执行它们，并在不同 notebook 之间复用逻辑。

    ### marimo notebook 不保存输出
    marimo _不会_把输出保存在文件中；如果你想保存输出，请确保用 Python 把它们写到磁盘，或者通过 notebook 菜单导出为 HTML。

    ### marimo notebook 可以用 git 版本管理

    marimo 的设计目标之一，就是让代码中的小改动只产生很小的 git diff！
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 结束语

    marimo 是对 Python notebook 的一次**重新发明**：它把 notebook 变成了可复现、可交互、可分享的 Python 程序，而不再是容易出错的草稿本。

    我们相信，所用的工具会塑造我们的思维方式——更好的工具，带来更好的思维。借助 marimo，我们希望为 Python 社区提供一个更好的编程环境，用于研究与交流、用于代码实验与分享、用于学习与教授计算科学。

    marimo 编辑器和库还有许多这里没有提到的功能。
    请查看[文档](https://docs.marimo.io/)了解更多！

    _本指南改编自 [Pluto for Jupyter users](https://featured.plutojl.org/basic/pluto%20for%20jupyter%20users)。
    我们 ❤️ Pluto.jl！_
    """)
    return


if __name__ == "__main__":
    app.run()
